"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function initializeStudentProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("students").insert([{
    id: user.id,
    full_name: user.email?.split("@")[0] || "New Student",
    program: "TBD",
    year_of_study: 1,
    gender: "Male"
  }]);

  if (error) {
    console.error("Initialization error:", error);
    return { error: error.message };
  }

  revalidatePath("/portal");
  return { success: true };
}

// --- BUILDINGS & ROOMS ---

export async function getBuildings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buildings")
    .select("*, proctors(full_name), rooms(capacity, current_occupancy, floor)")
    .order("name");
  
  if (error) throw error;
  return data;
}

export async function getRooms(buildingId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("building_id", buildingId)
    .order("floor")
    .order("id");
  
  if (error) throw error;
  return data;
}

// --- APPLICATIONS ---

export async function submitApplication(payload: {
  preferred_building_id: number;
  preferred_floor: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };
  
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        student_id: user.id,
        preferred_building_id: payload.preferred_building_id,
        preferred_floor: payload.preferred_floor,
        status: "Pending",
      },
    ])
    .select();

  if (error) return { error: error.message };
  
  revalidatePath("/portal");
  return { data };
}

export async function updateApplicationStatus(id: string, status: 'Approved' | 'Rejected') {
  const supabase = await createClient();
  
  // 1. Verify Admin/Proctor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const role = user?.app_metadata?.role;
  const { data: isProctor } = await supabase
    .from("proctors")
    .select("id")
    .eq("id", user.id)
    .single();

  const isStaff = role === 'admin' || role === 'proctor' || !!isProctor;

  if (!isStaff) {
    return { error: "Unauthorized. Staff privileges required." };
  }
  
  // 2. Fetch Application Current State
  const { data: currentApp } = await supabase
    .from("applications")
    .select("*, students(*)")
    .eq("id", id)
    .single();

  if (!currentApp) return { error: "Application not found" };

  // 3. Handle Transitions
  if (status === 'Approved' && currentApp.status !== 'Approved') {
    // A. FIND NEW ROOM
    const { data: availableRooms } = await supabase
      .from("rooms")
      .select("*")
      .eq("building_id", currentApp.preferred_building_id)
      .eq("floor", currentApp.preferred_floor);
    
    const targetRoom = availableRooms?.find(r => r.current_occupancy < r.capacity);
    if (!targetRoom) return { error: "No available beds in that building/floor." };

    // B. UPDATE STUDENT & INCREMENT ROOM
    await supabase.from("students").update({ 
      building_id: currentApp.preferred_building_id,
      room_id: targetRoom.id
    }).eq("id", currentApp.student_id);

    await supabase.from("rooms").update({ 
      current_occupancy: targetRoom.current_occupancy + 1 
    }).eq("id", targetRoom.id);
  } 
  else if (status !== 'Approved' && currentApp.status === 'Approved') {
    // C. HANDLE DECREMENT (Withdrawing Approval)
    if (currentApp.students?.room_id) {
      const { data: oldRoom } = await supabase.from("rooms").select("current_occupancy").eq("id", currentApp.students.room_id).single();
      if (oldRoom) {
        await supabase.from("rooms").update({ 
          current_occupancy: Math.max(0, oldRoom.current_occupancy - 1) 
        }).eq("id", currentApp.students.room_id);
      }
      await supabase.from("students").update({ building_id: null, room_id: null }).eq("id", currentApp.student_id);
    }
  }

  // 4. Update application status

  // 3. Update application status
  const { data, error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) return { error: error.message };
  
  revalidatePath("/admin");
  revalidatePath("/portal");
  return { data };
}

// --- MAINTENANCE ---

export async function reportMaintenance(payload: {
  room_id: number;
  issue_description: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };
  
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert([
      {
        room_id: payload.room_id,
        reported_by: user.id,
        issue_description: payload.issue_description,
        status: "Open",
      },
    ])
    .select();

  if (error) return { error: error.message };
  
  revalidatePath("/portal");
  return { data };
}


export async function updateMaintenanceStatus(id: string, status: 'Open' | 'In Progress' | 'Closed') {
  const supabase = await createClient();
  
  // Verify Admin/Proctor
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;
  if (!user || (role !== 'admin' && role !== 'proctor')) {
    return { error: "Unauthorized. Admin privileges required." };
  }

  const { data, error } = await supabase
    .from("maintenance_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) return { error: error.message };
  
  revalidatePath("/admin");
  revalidatePath("/portal");
  return { data };
}
