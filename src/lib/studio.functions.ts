import { supabase } from "@/integrations/supabase/client";

export async function getBookedSlots(date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("time_slot")
    .eq("booking_date", date)
    .not("status", "eq", "cancelled");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.time_slot);
}
