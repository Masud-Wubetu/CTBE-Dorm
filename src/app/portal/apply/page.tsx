"use client";

import { useState, useEffect } from "react";
import { getBuildings, submitApplication } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplicationPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    preferred_building_id: "",
    preferred_floor: "1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFull, setIsFull] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await getBuildings();
        setBuildings(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, preferred_building_id: data[0].id.toString() }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBuildings();
  }, []);

  // Check Availability whenever building or floor changes
  useEffect(() => {
    if (!formData.preferred_building_id || !formData.preferred_floor) return;

    const building = buildings.find(b => b.id.toString() === formData.preferred_building_id);
    if (!building) return;

    const floorRooms = building.rooms?.filter((r: any) => r.floor.toString() === formData.preferred_floor);
    
    if (floorRooms && floorRooms.length > 0) {
      const hasSpace = floorRooms.some((r: any) => r.current_occupancy < r.capacity);
      setIsFull(!hasSpace);
    } else {
      // If no rooms exist on this floor yet in the DB
      setIsFull(false); 
    }
  }, [formData, buildings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;
    setLoading(true);
    
    try {
      const result = await submitApplication({
        preferred_building_id: parseInt(formData.preferred_building_id),
        preferred_floor: parseInt(formData.preferred_floor),
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in flex justify-center">
      <div className="card-premium p-10 md:p-14 max-w-2xl w-full relative overflow-hidden group">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700" />

        <div className="flex items-center justify-between mb-10 relative">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-gradient">Housing Application</h1>
            <p className="极为 text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Select your preferred residence</p>
          </div>
          <Link href="/portal" className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">CANCEL</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="section-label ml-1">Preferred Building</label>
            <select
              value={formData.preferred_building_id}
              onChange={(e) => setFormData({ ...formData, preferred_building_id: e.target.value })}
              className="input-premium appearance-none cursor-pointer"
              required
            >
              {buildings.length > 0 ? (
                buildings.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-[#0a0a0c]">{b.name} ({b.type})</option>
                ))
              ) : (
                <option value="" disabled>Loading facilities...</option>
              )}
            </select>
          </div>

          <div className="space-y-4">
            <label className="section-label ml-1">Preferred Floor</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {['G', '1', '2', '3', '4', '5'].map((floorLabel, i) => (
                <button
                  key={floorLabel}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_floor: i.toString() })}
                  className={`py-4 rounded-2xl border transition-all font-black text-sm ${
                    formData.preferred_floor === i.toString()
                      ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-500/40"
                  }`}
                >
                  {floorLabel}
                </button>
              ))}
            </div>
          </div>

          {isFull ? (
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-shake">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-red-600 dark:text-red-400 font-bold text-sm">Selection Currently Full</p>
                <p className="text-[10px] text-red-500/60 font-medium uppercase tracking-tight">There are no available beds on this floor. Please select another.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
              <span className="text-3xl text-emerald-500">✅</span>
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Space Available</p>
                <p className="text-[10px] text-emerald-500/60 font-medium uppercase tracking-tight">This floor currently has vacancies for allocation.</p>
              </div>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-[11px] text-slate-400 font-medium leading-relaxed italic">
            <strong>Policy:</strong> Ground floor is reserved for priority students (Final year or Special Needs). Allocation occurs within 1-2 business days.
          </div>

          <button
            type="submit"
            disabled={loading || buildings.length === 0 || isFull}
            className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all h-16 flex items-center justify-center ${
              isFull 
                ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isFull ? "SELECTION FULL" : "SUBMIT APPLICATION"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
