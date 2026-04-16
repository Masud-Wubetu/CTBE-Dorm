"use client";

import { useState } from "react";
import { reportMaintenance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportMaintenancePage() {
  const [formData, setFormData] = useState({
    issue_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, we'd know which room the student is in
      // For this demo, we'll assume a default or pull from profile (handled server-side usually)
      // The schema needs a room_id. I'll pass a dummy one if no profile is found, 
      // but ideally the server action should verify the student's room.
      
      const result = await reportMaintenance({
        room_id: 1, // This should be dynamic based on user profile
        issue_description: formData.issue_description,
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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="glass p-8 rounded-3xl shadow-2xl space-y-8 animate-fade-in relative">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Report Issue</h1>
          <Link href="/portal" className="text-slate-500 hover:text-blue-500 transition-colors">Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Issue Description</label>
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              placeholder="Please describe the problem in detail (e.g. Broken window latch in R-304)"
              rows={5}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all dark:text-white resize-none"
              required
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-slate-600 dark:text-slate-400 flex gap-3">
             <span className="text-lg">⚠️</span>
             <p>Maintenance staff will process your request within 24 hours. Emergency issues (flooding, fire, security) should be reported directly to the proctor office.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center h-14"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Submit Ticket"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
