import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAnnouncements } from "@/lib/announcements";
import InitializeProfileButton from "@/components/InitializeProfileButton";

export default async function StudentPortal() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/portal/login");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*, buildings(name), rooms(*)")
    .eq("id", user.id)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    console.error("Portal Data Error:", studentError);
  }

  // If no student profile found, check if they are staff to show a helpful link
  if (!student) {
    const { data: proctor } = await supabase
      .from("proctors")
      .select("id")
      .eq("id", user.id)
      .single();

    const isStaff = !!proctor || user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'proctor';

    return (
      <div className="flex items-center justify-center min-h-[90vh] px-6">
        <div className="card-premium p-12 text-center max-w-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg border border-amber-500/20">👤</div>
          <h2 className="text-3xl font-bold font-display mb-3 tracking-tight">
            {isStaff ? "Staff Account" : "Profile Not Found"}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            {isStaff 
              ? "You are logged in with staff privileges. You can manage the system or initialize a student profile for testing."
              : "Your login is successful, but your residential profile hasn't been initialized yet."}
          </p>
          
          <div className="space-y-4">
             {isStaff && (
               <Link href="/admin" className="btn-ghost w-full py-4 mb-2 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 rounded-2xl">
                 <span>⚙️</span> Go to Admin Dashboard
               </Link>
             )}
             <InitializeProfileButton />
             <Link href="/portal/login" className="block text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-[0.2em] mt-4">
               LOG OUT & RE-LOGIN
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- REST OF THE PAGE ---
  const { data: applications } = await supabase
    .from("applications")
    .select("*, buildings(name)")
    .eq("student_id", user.id)
    .order("application_date", { ascending: false });

  const { data: maintenanceRequests } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("reported_by", user.id)
    .order("created_at", { ascending: false });

  const announcements = await getAnnouncements(student.building_id);
  const getRel = (obj: any) => Array.isArray(obj) ? obj[0] : obj;
  const bldgName = getRel(student.buildings)?.name || "No Assignment Yet";
  const roomLabel = getRel(student.rooms)?.room_label || getRel(student.rooms)?.id || "---";
  const roomFloor = getRel(student.rooms)?.floor || "G";

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-8 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-gradient mb-1">Student Portal</h1>
          <p className="text-slate-500 font-medium truncate">Welcome back, {student.full_name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/auth/signout" method="post">
            <button className="btn-ghost flex items-center gap-2 text-sm bg-white dark:bg-white/[0.02] shadow-sm"><span>🚪</span> Sign Out</button>
          </form>
        </div>
      </header>

      {/* ANNOUNCEMENT BANNER */}
      {announcements && announcements.length > 0 && (
        <div className="mb-12 space-y-4">
          {announcements.map((a: any) => (
             <div key={a.id} className={`p-4 rounded-3xl border flex gap-4 items-center animate-bounce-subtle ${a.type === 'Urgent' ? 'bg-red-500/10 border-red-500/30' : a.type === 'Warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="text-2xl">{a.type === 'Urgent' ? '🚨' : a.type === 'Warning' ? '⚠️' : '📢'}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold uppercase tracking-tight">{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{a.content}</p>
                </div>
             </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-8">
          {/* DIGITAL ID CARD */}
          <section className="card-premium overflow-hidden p-0 bg-gradient-to-br from-[#0c0c0e] to-[#1a1a1e]">
             <div className="p-8 border-b border-white/[0.05] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full" />
                <div className="flex justify-between items-start relative z-10">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-black text-xs tracking-tighter">CTBE</div>
                   <div className="text-right">
                      <p className="极为 text-[8px] font-black text-blue-500 uppercase tracking-widest">Digital ID</p>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Year 2026</p>
                   </div>
                </div>
                <div className="mt-8 relative z-10 flex gap-6">
                   <div className="w-20 h-20 rounded-2xl bg-white/10 p-1">
                      <div className="w-full h-full rounded-[0.9rem] bg-white flex items-center justify-center text-black text-2xl font-black">{student.full_name?.charAt(0)}</div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{student.full_name}</h3>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 truncate">{student.program}</p>
                      <div className="mt-4 flex gap-4">
                        <div className="min-w-0"><p className="极为 text-[7px] text-slate-500 uppercase font-black tracking-widest">Hall</p><p className="text-[10px] text-white font-bold truncate">{bldgName}</p></div>
                        <div><p className="极为 text-[7px] text-slate-500 uppercase font-black tracking-widest">Room</p><p className="text-[10px] text-white font-bold">{roomLabel}</p></div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-white/5 p-4 flex justify-between items-center text-[8px] font-black text-emerald-500 uppercase tracking-widest">VERIFIED RESIDENT · CTBE SYSTEM</div>
          </section>

          <section className="card-premium p-8 space-y-4">
            <h3 className="section-label">Residential Status</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
              <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-slate-400 uppercase">Status</span><span className={student.room_id ? "badge-green" : "badge-yellow"}>{student.room_id ? "ALLOCATED" : "PENDING"}</span></div>
              <p className="text-sm font-bold truncate">{bldgName}</p>
              {student.room_id && <p className="text-xs text-slate-500 mt-1">Room {roomLabel} · {roomFloor}th Floor</p>}
            </div>
          </section>
        </aside>

        <div className="lg:col-span-8 space-y-8">
          <section className="grid sm:grid-cols-2 gap-6">
            <Link href="/portal/apply" className="card-premium p-8 group hover:border-blue-500/50 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform text-6xl">📝</div>
               <h3 className="text-xl font-bold font-display mb-2">Apply for Housing</h3>
               <p className="text-xs text-slate-500 font-medium">Request a spot for the next semester.</p>
               <div className="mt-6 text-blue-500 font-bold text-xs uppercase tracking-widest">START APPLICATION →</div>
            </Link>
            <Link href="/portal/report" className="card-premium p-8 group hover:border-amber-500/50 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform text-6xl">🛠️</div>
               <h3 className="text-xl font-bold font-display mb-2">Service Request</h3>
               <p className="text-xs text-slate-500 font-medium">Report issues in your room.</p>
               <div className="mt-6 text-amber-500 font-bold text-xs uppercase tracking-widest">REPORT ISSUE →</div>
            </Link>
          </section>

          {student.room_id && (
            <div className="card-premium p-10 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] bg-emerald-500/20 -z-10" />
              <div className="flex items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold font-display mb-2 text-emerald-500">Placement Confirmed!</h3>
                  <p className="text-sm text-slate-500 font-medium">Your room key ({roomLabel}) is ready for pickup at the proctor's office.</p>
                </div>
                <div className="hidden sm:block text-7xl opacity-40">🏡</div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7 card-premium"><div className="p-8 border-b border-slate-200 dark:border-white/[0.08] font-bold">Applications</div><table className="w-full divide-y divide-slate-100 dark:divide-white/[0.05]">{applications?.map((app) => (<tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01]"><td className="px-8 py-5 text-xs font-bold">{new Date(app.application_date).toLocaleDateString()}</td><td className="px-8 py-5 text-right"><span className={app.status === "Approved" ? "badge-green" : "badge-yellow"}>{app.status}</span></td></tr>))}</table></div>
            <div className="md:col-span-5 card-premium p-8"><h3 className="text-lg font-bold font-display mb-6">Service Tickets</h3><div className="space-y-4">{maintenanceRequests?.map((req) => { const isOld = (new Date().getTime() - new Date(req.created_at).getTime()) > 86400000; return (<div key={req.id} className={`p-4 rounded-2xl border transition-all ${isOld && req.status === 'Open' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-50 dark:bg-white/[0.01] border-slate-100 dark:border-white/[0.05]'}`}><div className="flex justify-between items-center mb-1"><p className="text-xs font-bold truncate flex-1">{req.issue_description}</p><div className={`w-1.5 h-1.5 rounded-full ${req.status === 'Closed' ? 'bg-emerald-500' : isOld ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} /></div>{isOld && req.status === 'Open' && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">SLA Overdue</p>}</div>); })}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
