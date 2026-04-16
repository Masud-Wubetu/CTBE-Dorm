"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;
      
      // Check if user is in proctors table as a fallback for role detection
      const { data: proctor } = await supabase
        .from("proctors")
        .select("id")
        .eq("id", user?.id)
        .single();
      
      // Check for student profile existence
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("id", user?.id)
        .single();
      
      if (student) {
        router.push("/portal");
      } else if (role === 'admin' || role === 'proctor' || proctor) {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="glass-card p-10 md:p-14 relative overflow-hidden group">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] -z-10 group-hover:bg-blue-600/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[60px] -z-10 group-hover:bg-indigo-600/20 transition-all duration-700" />

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-xl shadow-blue-500/20">C</div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-gradient mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Access your CTBEDorm management suite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="section-label ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masud@example.com"
                className="input-premium"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="section-label ml-1">Password</label>
                <Link href="#" className="text-[10px] font-bold text-blue-500 hover:underline">FORGOT PASSWORD?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-premium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center h-14"
            >
              {loading ? (
                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "SIGN INTO PORTAL"
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-500 font-medium">
            Don't have a student account?{" "}
            <Link href="/portal/signup" className="text-blue-500 font-bold hover:underline tracking-tighter">
              CREATE ONE HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
