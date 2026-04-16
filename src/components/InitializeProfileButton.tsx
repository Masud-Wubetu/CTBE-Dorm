"use client";

import { useState } from "react";
import { initializeStudentProfile } from "@/lib/actions";

export default function InitializeProfileButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const result = await initializeStudentProfile(formData);
      
      if (result?.error) {
        alert(`Failed to initialize: ${result.error}`);
      } else {
        // Refresh to get the new student state
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className="btn-primary w-full py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 h-14"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Initializing...
        </>
      ) : (
        "Initialize My Profile Now"
      )}
    </button>
  );
}
