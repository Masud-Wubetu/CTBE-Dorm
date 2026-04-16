"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBuildings } from "@/lib/actions";

export default function StaffManagement() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [proctors, setProctors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Check if admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (user.app_metadata.role !== 'admin' && user.app_metadata.role !== 'proctor')) {
        router.push("/portal/login");
        return;
      }

      // 2. Fetch Data
      const bData = await getBuildings();
      setBuildings(bData);

      const { data: pData } = await supabase.from("proctors").select("*").order("full_name");
      setProctors(pData || []);

      const { data: sData } = await supabase.from("students").select("*").order("full_name");
      setStudents(sData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function promoteToStaff(student: any) {
    setLoading(true);
    try {
      // 1. Add to proctors table using the student's ID
      const { error: pError } = await supabase
        .from("proctors")
        .insert([{
          id: student.id,
          full_name: student.full_name,
          phone_number: student.phone_number || "N/A"
        }]);

      if (pError) throw pError;
      
      alert(`${student.full_name} is now a Proctor and has Dashboard access!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function assignProctor(buildingId: number, proctorId: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("buildings")
        .update({ proctor_id: proctorId === "null" ? null : proctorId })
        .eq("id", buildingId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  ).filter(s => !proctors.some(p => p.id === s.id));

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-8 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-gradient mb-1">Staff Directory</h1>
          <p className="text-slate-500 font-medium">Elevate students to staff roles and manage assignments.</p>
        </div>
        <Link href="/admin" className="btn-ghost text-sm flex items-center gap-2">← Return to Dashboard</Link>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Building Assignments */}
        <div className="lg:col-span-7 space-y-8">
          <section className="card-premium">
            <div className="p-8 border-b border-slate-200 dark:border-white/[0.08]">
              <h2 className="text-xl font-bold font-display">Building Responsibilities</h2>
              <p className="text-sm text-slate-500">Assign a proctor to oversee each facility</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/[0.01]">
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/[0.05]">
                    <th className="px-8 py-4">Facility</th>
                    <th className="px-4 py-4">Proctor In-Charge</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {buildings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01]">
                      <td className="px-8 py-5 font-bold">{b.name}</td>
                      <td className="px-4 py-5">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[10px]">
                             {b.proctors?.full_name?.charAt(0) || "?"}
                           </div>
                           <span className="text-sm font-medium">{b.proctors?.full_name || "Unassigned"}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <select 
                          className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          onChange={(e) => assignProctor(b.id, e.target.value)}
                          value={b.proctor_id || "null"}
                        >
                          <option value="null" className="dark:bg-[#0a0a0c]">Release Assignment</option>
                          {proctors.map(p => (
                            <option key={p.id} value={p.id} className="dark:bg-[#0a0a0c]">{p.full_name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Promotion Center */}
        <div className="lg:col-span-5 space-y-8">
          <section className="card-premium p-8">
            <h3 className="section-label">Promote Student to Staff</h3>
            <div className="mb-6">
               <input 
                 type="text" 
                 placeholder="Search by name or email..." 
                 className="input-premium py-2 text-sm"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudents.length > 0 ? filteredStudents.map(s => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold">
                      {s.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{s.full_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{s.program}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => promoteToStaff(s)}
                    className="text-[10px] font-black text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest"
                  >
                    Promote
                  </button>
                </div>
              )) : (
                <p className="text-center py-8 text-xs text-slate-500 italic">No eligible students found.</p>
              )}
            </div>
          </section>

          <section className="card-premium p-8 bg-blue-500/[0.02] border-blue-500/10">
            <div className="flex gap-4">
              <div className="text-3xl">🛡️</div>
              <div>
                <h4 className="text-sm font-bold mb-1">Authorization Note</h4>
                <p className="极为 text-[10px] text-slate-500 leading-relaxed font-medium">Promoting a student immediately grants them access to the Administration Dashboard and sensitive maintenance controls. Action is logged in the system audit.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
