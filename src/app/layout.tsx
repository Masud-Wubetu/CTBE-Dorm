import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "CTBE | Dormitory Allocation System",
  description: "Advanced Student Housing Management for College of Technology and Built Environment",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole = user?.app_metadata?.role;
  let isProctor = false;

  if (user) {
    const { data: proctorData } = await supabase
      .from("proctors")
      .select("id")
      .eq("id", user.id)
      .single();
    isProctor = !!proctorData;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-grid">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Glows */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/15" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/15" />
          </div>

          <Navbar userRole={userRole} isProctor={isProctor} user={user} />

          {/* Main Content */}
          <main className="pt-28">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 border-t border-slate-200 dark:border-white/[0.06] py-12 text-center">
            <div className="max-w-6xl mx-auto px-6">
              <div className="font-display text-xl font-bold mb-4">
                CTBE<span className="text-blue-500">Dorm</span>
              </div>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                Modern student housing management for the College of Technology and Built Environment.
                Efficiency, fairness, and transparency in every allocation.
              </p>
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} CTBE Dormitory Allocation System. All rights reserved.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

