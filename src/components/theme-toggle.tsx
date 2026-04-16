"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className="h-5 w-5 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-5 w-5 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-blue-400" />
      </div>
      
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}
