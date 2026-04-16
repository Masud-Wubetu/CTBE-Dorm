"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ViewState = 'buildings' | 'floors';

export default function RoomInventory() {
  const [view, setView] = useState<ViewState>('buildings');
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Auth Check
      const { data: { user } } = await supabase.auth.getUser();
      const { data: isStaff } = await supabase.from("proctors").select("id").eq("id", user?.id).single();
      const role = user?.app_metadata?.role;

      if (!user || (role !== 'admin' && role !== 'proctor' && !isStaff)) {
        router.push("/portal/login");
        return;
      }

      // Fetch Buildings with room stats
      const { data: bData } = await supabase.from("buildings").select("*, rooms(capacity, current_occupancy)");
      setBuildings(bData || []);

      // Fetch All Rooms
      const { data: rData } = await supabase.from("rooms").select("*");
      setRooms(rData || []);

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getBuildingStats = (b: any) => {
    let cap = 0; let occ = 0;
    b.rooms?.forEach((r: any) => { cap += r.capacity; occ += r.current_occupancy; });
    return { cap, occ, pct: cap > 0 ? Math.round((occ / cap) * 100) : 0 };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-fade-in">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-8 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Link href="/admin" className="text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">Dashboard</Link>
             <span className="text-slate-300">/</span>
             <button onClick={() => setView('buildings')} className={`text-[10px] font-black uppercase tracking-[0.2em] ${view === 'buildings' ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`}>Inventory</button>
             {selectedBuilding && (
               <>
                 <span className="text-slate-300">/</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedBuilding.name}</span>
               </>
             )}
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">
            {view === 'buildings' ? 'Facility Explorer' : selectedBuilding?.name}
          </h1>
        </div>
        
        {view === 'floors' && (
          <button onClick={() => setView('buildings')} className="btn-ghost text-xs px-6 py-2">
            ← Change Building
          </button>
        )}
      </header>

      {/* VIEW: BUILDINGS */}
      {view === 'buildings' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {buildings.map((b) => {
            const stats = getBuildingStats(b);
            return (
              <button 
                key={b.id} 
                onClick={() => { setSelectedBuilding(b); setView('floors'); }}
                className="card-premium p-8 text-left group hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-8xl -rotate-12 translate-x-4 -translate-y-4">🏢</div>
                <div className="mb-6">
                  <span className={b.type === "Male" ? "badge-blue" : "badge-yellow"}>{b.type} HALL</span>
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">{b.name}</h3>
                <p className="极为 text-xs text-slate-500 font-medium mb-8">Ground + 5 FLOORS · {b.rooms?.length || 0} ROOMS</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy Rate</span>
                    <span className="text-lg font-bold">{stats.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest pt-2">
                    {stats.cap - stats.occ} BEDS AVAILABLE
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW: FLOORS & ROOMS */}
      {view === 'floors' && (
        <div className="space-y-12">
          {/* Floor Selector Bar */}
          <div className="card-premium p-2 flex flex-wrap gap-2 sticky top-[100px] z-30 shadow-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
            {['G', '1', '2', '3', '4', '5'].map((f, i) => (
              <button 
                key={f} 
                onClick={() => setSelectedFloor(i)}
                className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${selectedFloor === i ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400'}`}
              >
                {f === 'G' ? 'GROUND' : `FLOOR ${f}`}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Room Grid for Selected Floor */}
            <div className="space-y-6">
              <h3 className="section-label">Room Grid · {selectedFloor === 0 ? 'Ground' : `Floor ${selectedFloor}`}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(roomNum => {
                  const floorRooms = rooms.filter(r => r.building_id === selectedBuilding.id && r.floor === selectedFloor);
                  const room = floorRooms[roomNum - 1];
                  
                  return (
                    <div key={roomNum} className={`card-premium p-6 flex flex-col items-center justify-center text-center transition-all ${room ? 'hover:scale-105 cursor-default' : 'opacity-30'}`}>
                      {room ? (
                        <>
                          <div className={`w-3 h-3 rounded-full mb-3 ${room.current_occupancy >= room.capacity ? 'bg-red-500' : 'bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse'}`} />
                          <h4 className="text-2xl font-black mb-1">#{room.room_label}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Room {roomNum}</p>
                          <div className="w-full bg-slate-100 dark:bg-white/10 h-1 rounded-full mb-2">
                             <div className="h-full bg-blue-500" style={{ width: `${(room.current_occupancy/room.capacity)*100}%` }} />
                          </div>
                          <p className="text-xs font-bold">{room.current_occupancy} / {room.capacity} <span className="text-[10px] text-slate-400 uppercase font-medium">Occupied</span></p>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-slate-300 dark:bg-white/20 rounded-full mb-3" />
                          <h4 className="text-xl font-black text-slate-300 dark:text-white/20">---</h4>
                          <p className="text-[10px] font-bold text-slate-300 dark:text-white/20 uppercase tracking-widest">Locked</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Sidebar (Mini Insights) */}
            <div className="space-y-6">
               <section className="card-premium p-8 bg-blue-600">
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Floor Insights</h3>
                  <div className="space-y-6 text-white">
                    <div>
                      <p className="opacity-60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Capacity</p>
                      <p className="text-3xl font-black">
                        {rooms.filter(r => r.building_id === selectedBuilding.id && r.floor === selectedFloor).reduce((acc, r) => acc + r.capacity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="opacity-60 text-[10px] font-bold uppercase tracking-widest mb-1">Available Beds</p>
                      <p className="text-3xl font-black">
                        {rooms.filter(r => r.building_id === selectedBuilding.id && r.floor === selectedFloor).reduce((acc, r) => acc + (r.capacity - r.current_occupancy), 0)}
                      </p>
                    </div>
                  </div>
               </section>

               <section className="card-premium p-8">
                 <h3 className="section-label">Inventory Help</h3>
                 <p className="极为 text-xs text-slate-500 leading-relaxed">Grey rooms denote facility storage or locked units. Click an active room to view its occupant list (Coming soon).</p>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
