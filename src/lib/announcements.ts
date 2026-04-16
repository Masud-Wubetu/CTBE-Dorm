"use server";

import { createClient } from "@/lib/supabase/server";

export async function createAnnouncement(payload: {
  building_id: number | null;
  title: string;
  content: string;
  type: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Auth required" };

  const { data, error } = await supabase
    .from("announcements")
    .insert([{
      ...payload,
      created_by: user.id
    }]);

  if (error) return { error: error.message };
  return { data };
}

export async function getAnnouncements(building_id?: number) {
  const supabase = await createClient();
  let query = supabase.from("announcements").select("*").order("created_at", { ascending: false });
  
  if (building_id) {
    query = query.or(`building_id.eq.${building_id},building_id.is.null`);
  } else {
    query = query.is("building_id", null);
  }

  const { data, error } = await query.limit(5);
  if (error) {
    console.error("Announcements error:", error);
    return [];
  }
  return data || [];
}
