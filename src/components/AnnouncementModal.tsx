"use client";

import { useState } from "react";
import { createAnnouncement } from "@/lib/announcements";

export default function AnnouncementModal({ buildings, onClose }: { buildings: any[], onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    building_id: "null",
    title: "",
    content: "",
    type: "Info"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createAnnouncement({
      ...formData,
      building_id: formData.building_id === "null" ? null : parseInt(formData.building_id)
    });
    if (res.error) alert(res.error);
    else {
      alert("Announcement posted!");
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-premium max-w-lg w-full p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
        
        <div className="flex justify-between items-center mb-8 relative">
          <h3 className="text-2xl font-bold font-display">Post Announcement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="section-label">Target Audience</label>
               <select 
                 className="input-premium py-2 text-xs"
                 value={formData.building_id}
                 onChange={(e) => setFormData({...formData, building_id: e.target.value})}
               >
                 <option value="null">All Residents (Global)</option>
                 {buildings.map(b => (
                   <option key={b.id} value={b.id}>{b.name}</option>
                 ))}
               </select>
             </div>
             <div className="space-y-2">
               <label className="section-label">Priority Type</label>
               <select 
                 className="input-premium py-2 text-xs"
                 value={formData.type}
                 onChange={(e) => setFormData({...formData, type: e.target.value})}
               >
                 <option value="Info">ℹ️ Info</option>
                 <option value="Warning">⚠️ Warning</option>
                 <option value="Urgent">🚨 Urgent</option>
               </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="section-label">Subject</label>
            <input 
              className="input-premium py-2 text-sm" 
              placeholder="e.g. Water Maintenance"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="section-label">Message Content</label>
            <textarea 
              className="input-premium py-4 text-sm min-h-[100px]" 
              placeholder="Provide details for the students..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest h-14"
          >
            {loading ? "SENDING..." : "BROADCAST TO RESIDENTS"}
          </button>
        </form>
      </div>
    </div>
  );
}
