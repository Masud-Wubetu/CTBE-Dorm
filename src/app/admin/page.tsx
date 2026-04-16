import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationStatus, updateMaintenanceStatus } from "@/lib/actions";
import { redirect } from "next/navigation";
import AnnouncementControl from "@/components/AnnouncementControl";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/portal/login");

  const role = user?.app_metadata?.role;
  const { data: isProct } = await supabase.from("proctors").select("id").eq("id", user.id).single();

  if (role !== 'admin' && role !== 'proctor' && !isProct) {
    redirect("/portal/login");
  }

  // Live Aggregate Data
  const { count: studentCount } = await supabase.from("students").select("*", { count: 'exact', head: true });
  const { data: buildings } = await supabase.from("buildings").select("*, proctors(full_name), rooms(capacity, current_occupancy)");
  const { data: pendingApps } = await supabase.from("applications").select("*, students(full_name, program, room_id, buildings(name), rooms(room_label))").eq("status", "Pending");
  const { data: openMaintenance } = await supabase.from("maintenance_requests").select("*, rooms(buildings(name))").eq("status", "Open");

  // Live Analytics Calculations
  const { data: allRooms } = await supabase.from("rooms").select("capacity, current_occupancy");
  let totalCapacity = 0;
  let currentOccupants = 0;
  allRooms?.forEach(r => {
    totalCapacity += r.capacity;
    currentOccupants += r.current_occupancy;
  });

  const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupants / totalCapacity) * 100) : 0;
  const totalStudents = studentCount || 0;
  const pendingCount = pendingApps?.length || 0;
  const maintenanceCount = openMaintenance?.length || 0;

  // Safety helper for relationships
  const getRel = (obj: any) => Array.isArray(obj) ? obj[0] : obj;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-8 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-gradient mb-2">Management Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">System status for CTBE Residential Services</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/rooms" className="btn-ghost flex items-center gap-2 text-sm bg-white dark:bg-white/[0.02] shadow-sm"><span>🛏️</span> Inventory</Link>
          <Link href="/admin/staff" className="btn-ghost flex items-center gap-2 text-sm bg-white dark:bg-white/[0.02] shadow-sm"><span>👥</span> Staff</Link>
          <AnnouncementControl buildings={buildings || []} />
          <form action="/auth/signout" method="post">
            <button className="btn-ghost flex items-center gap-2 text-sm text-red-500"><span>🚪</span> Out</button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Enrollment" value={totalStudents.toLocaleString()} trend="Active Records" icon="👥" color="text-blue-600" />
        <StatCard title="Global Occupancy" value={`${occupancyRate}%`} trend={`${totalCapacity - currentOccupants} beds free`} icon="🏠" color="text-emerald-600" />
        <StatCard title="Pending Review" value={pendingCount.toString()} trend="Queue length" icon="📋" color="text-indigo-600" />
        <StatCard title="Maintenance" value={maintenanceCount.toString()} trend="Active tickets" icon="🛠️" color="text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="card-premium">
            <div className="p-8 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <h2 className="text-xl font-bold font-display">Facility Overview</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{buildings?.length || 0} BUILDINGS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {buildings?.map((b) => (
                    <BuildingRow 
                      key={b.id} 
                      name={b.name} 
                      type={b.type} 
                      proctor={getRel(b.proctors)?.full_name || "Unassigned"} 
                      pct={Math.round((b.rooms?.reduce((acc: any, r: any) => acc + r.current_occupancy, 0) / 
                          b.rooms?.reduce((acc: any, r: any) => acc + r.capacity, 0)) * 100) || 0} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card-premium">
            <div className="p-8 border-b border-slate-200 dark:border-white/[0.08]">
              <h2 className="text-xl font-bold font-display">Active Service Requests</h2>
            </div>
            <div className="p-6 grid gap-4">
              {openMaintenance?.map((req) => (
                <MaintenanceRow 
                  key={req.id} id={req.id} 
                  room={`Room ${req.room_id}`} 
                  issue={req.issue_description} 
                  building={getRel(getRel(req.rooms)?.buildings)?.name || "Bldg"} 
                  date={new Date(req.created_at).toLocaleDateString()} 
                  createdAt={req.created_at} 
                />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="card-premium">
            <div className="p-8 border-b border-slate-200 dark:border-white/[0.08]"><h2 className="text-xl font-bold font-display">Waitlist</h2></div>
            <div className="p-6 space-y-4">
              {pendingApps?.map((app) => (
                <ApplicationRow 
                  key={app.id} id={app.id} 
                  name={getRel(app.students)?.full_name || "Unknown"} 
                  program={getRel(app.students)?.program || "General"} 
                  building={app.preferred_building_id} 
                  floor={app.preferred_floor} 
                  allocated_room={getRel(app.students)?.room_id}
                  allocated_building={getRel(getRel(app.students)?.buildings)?.name}
                  allocated_room_label={getRel(getRel(app.students)?.rooms)?.room_label}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: any) {
  return (
    <div className="stat-card">
      <div className="flex justify-between items-start mb-4"><span className="text-2xl">{icon}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span></div>
      <h3 className={`text-4xl font-bold font-display ${color} mb-1`}>{value}</h3>
      <p className="text-xs text-slate-500 font-medium">{trend}</p>
    </div>
  );
}

function BuildingRow({ name, type, proctor, pct }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-8 py-5 font-bold">{name}</td>
      <td className="px-4 py-5"><span className={type === "Male" ? "badge-blue" : "badge-yellow"}>{type}</span></td>
      <td className="px-4 py-5 text-sm text-slate-500">{proctor}</td>
      <td className="px-8 py-5 text-right"><span className={pct >= 100 ? "badge-red" : "badge-green"}>{pct}% FULL</span></td>
    </tr>
  );
}

function ApplicationRow({ id, name, program, building, floor, allocated_room, allocated_building, allocated_room_label }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">{name.charAt(0)}</div>
          <div><h4 className="text-sm font-bold">{name}</h4><p className="text-[10px] text-slate-500 uppercase">{program}</p></div>
        </div>
        <div className="text-right"><p className="text-xs font-bold">B{building} · F{floor}</p></div>
      </div>
      {allocated_room ? (
        <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold p-2 rounded-lg text-center border border-emerald-500/20">✓ {allocated_room_label} ({allocated_building})</div>
      ) : (
        <div className="flex gap-2">
          <form action={async () => { "use server"; await updateApplicationStatus(id, 'Approved'); }} className="flex-1">
            <button className="w-full py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg">Approve</button>
          </form>
          <form action={async () => { "use server"; await updateApplicationStatus(id, 'Rejected'); }} className="flex-1">
            <button className="w-full py-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg">Reject</button>
          </form>
        </div>
      )}
    </div>
  );
}

function MaintenanceRow({ id, room, issue, building, date, createdAt }: any) {
  const isOld = (new Date().getTime() - new Date(createdAt).getTime()) > 86400000;
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isOld ? 'bg-red-500/5 border-red-500/20 shadow-lg' : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08]'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isOld ? 'bg-red-500 text-white' : 'bg-amber-500/10'}`}>{isOld ? '🚨' : '🛠️'}</div>
        <div>
          <div className="flex items-center gap-2"><h4 className="text-sm font-bold">{issue}</h4>{isOld && <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Overdue</span>}</div>
          <p className="text-[10px] text-slate-500">{building} · {room} · {date}</p>
        </div>
      </div>
      <form action={async () => { "use server"; await updateMaintenanceStatus(id, 'Closed'); }}>
        <button className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl ${isOld ? 'bg-red-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}>Resolve</button>
      </form>
    </div>
  );
}
