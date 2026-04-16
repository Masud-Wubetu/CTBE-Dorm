"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  userRole?: string;
  isProctor?: boolean;
  user?: any;
}

export default function Navbar({ userRole, isProctor, user }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'admin' || userRole === 'proctor' || isProctor;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Portal", href: "/portal" },
    ...(isAdmin ? [{ name: "Administration", href: "/admin" }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.05] bg-white/50 dark:bg-black/20 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform">C</div>
          <span className="hidden sm:inline tracking-tighter">CTBEDORM<span className="text-blue-500 font-black">.</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-10 font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 transition-colors hover:text-blue-500 dark:hover:text-white ${
                  isActive ? "text-blue-600 dark:text-white" : ""
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
          
          {!user ? (
            <>
              <Link href="/portal/login" className="hidden sm:block text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-white transition-colors font-bold text-[11px] uppercase tracking-widest">
                Sign in
              </Link>
              <Link href="/portal/signup" className="btn-primary text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-blue-500/20">
                Register
              </Link>
            </>
          ) : (
            <form action="/auth/signout" method="post">
              <button className="text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <span>🚪</span> Sign Out
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
