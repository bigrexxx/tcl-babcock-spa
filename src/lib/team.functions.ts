import { supabase } from "@/integrations/supabase/client";

export async function listTeamMembers() {
  const { data, error } = await supabase
    .from("team_members")
    .select("id,name,role,department,photo_url,bio,kind,committee_id,sort_order")
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertTeamMember(payload: {
  id?: string;
  name: string;
  role: string;
  department?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  kind: "executive" | "director";
  committee_id?: string | null;
  sort_order?: number;
}) {
  const body = {
    name: payload.name,
    role: payload.role,
    department: payload.department || null,
    photo_url: payload.photo_url || null,
    bio: payload.bio || null,
    kind: payload.kind,
    committee_id: payload.committee_id || null,
    sort_order: payload.sort_order ?? 0,
  };
  if (payload.id) {
    const { error } = await supabase.from("team_members").update(body).eq("id", payload.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("team_members").insert(body);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function adminDeleteTeamMember(id: string) {
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
