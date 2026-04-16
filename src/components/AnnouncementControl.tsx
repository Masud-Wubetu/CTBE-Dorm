"use client";
import { useState } from "react";
import AnnouncementModal from "./AnnouncementModal";

export default function AnnouncementControl({ buildings }: { buildings: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-ghost flex items-center gap-2 text-sm bg-white dark:bg-white/[0.02] shadow-sm border border-indigo-500/20 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
      >
        <span>📢</span> Broadcast Alert
      </button>

      {isOpen && <AnnouncementModal buildings={buildings} onClose={() => setIsOpen(false)} />}
    </>
  );
}
