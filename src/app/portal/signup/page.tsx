"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    program: "",
    year_of_study: "1",
    gender: "Male"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from("students").insert([
        {
          id: authData.user.id,
          full_name: formData.full_name,
          program: formData.program,
          year_of_study: parseInt(formData.year_of_study),
          gender: formData.gender
        },
      ]);

      if (dbError) {
        setError(`Profile sync error: ${dbError.message}`);
        setLoading(false);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.app_metadata?.role;

        router.push("/portal");
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="glass-card p-10 md:p-14 relative overflow-hidden group">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px] -z-10 group-hover:bg-blue-600/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 blur-[80px] -z-10 group-hover:bg-indigo-600/20 transition-all duration-700" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-display tracking-tight text-gradient mb-3">Create Student Account</h1>
            <p className="text-slate-500 font-medium">Join CTBEDorm and request your residence assignment</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="section-label ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-premium"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="section-label ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-premium"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="section-label ml-1">Degree Program</label>
                <input
                  type="text"
                  required
                  className="input-premium"
                  placeholder="Software Engineering"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="section-label ml-1">Year</label>
                  <select
                    className="input-premium cursor-pointer appearance-none"
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                  >
                    {[1,2,3,4,5].map(y => <option key={y} value={y} className="dark:bg-[#0a0a0c]">Year {y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="section-label ml-1">Gender</label>
                  <select
                    className="input-premium cursor-pointer appearance-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Male" className="dark:bg-[#0a0a0c]">Male</option>
                    <option value="Female" className="dark:bg-[#0a0a0c]">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="section-label ml-1">Security Key (Password)</label>
              <input
                type="password"
                required
                className="input-premium"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 font-medium px-1">Ensure your password contains at least 8 characters including symbols.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center h-14"
            >
              {loading ? (
                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "INITIALIZE MY ACCOUNT"
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-xs text-slate-500 font-medium">
            Already registered?{" "}
            <Link href="/portal/login" className="text-blue-500 font-bold hover:underline tracking-tighter">
              ACCESS PORTAL HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
