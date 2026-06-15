import { supabase } from "@/integrations/supabase/client";

export async function getMyRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, roles: [] };
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const roles = (data ?? []).map((r) => r.role);
  return { isAdmin: roles.includes("admin"), roles };
}

export async function adminListApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminListBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminListCommittees() {
  const { data, error } = await supabase
    .from("committees")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpdateApplicationStatus(id: string, status: "pending" | "reviewing" | "accepted" | "rejected") {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminUpdateBookingStatus(id: string, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminDeleteApplication(id: string) {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminDeleteBooking(id: string) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminUpdateCommittee(payload: {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  highlights: string[];
}) {
  const { error } = await supabase
    .from("committees")
    .update({
      name: payload.name,
      icon: payload.icon,
      tagline: payload.tagline,
      description: payload.description,
      highlights: payload.highlights,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
