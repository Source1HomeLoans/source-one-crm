import type { SupabaseClient } from "@supabase/supabase-js";

export async function runLeadWorkflowMaintenance(supabase: SupabaseClient) {
  const now = new Date().toISOString();

  const { data: expiredAssignments } = await supabase
    .from("leads")
    .select("id, owner_id")
    .not("assignment_expires_at", "is", null)
    .lte("assignment_expires_at", now)
    .is("converted_at", null)
    .is("dnc_hold_until", null);

  for (const lead of expiredAssignments ?? []) {
    await supabase
      .from("leads")
      .update({
        assigned_to: null,
        assigned_at: null,
        assignment_expires_at: null,
        status: "new",
        shark_tank_status: "open"
      })
      .eq("id", lead.id);

    await supabase.from("communication_history").insert({
      owner_id: lead.owner_id,
      lead_id: lead.id,
      channel: "system_update",
      direction: "system",
      subject: "Lead returned to Shark Tank after 30-day assignment expiration",
      summary: "Lead returned to Shark Tank after 30-day assignment expiration",
      occurred_at: now
    });
  }

  const { data: expiredDncHolds } = await supabase
    .from("leads")
    .select("id, owner_id")
    .not("dnc_hold_until", "is", null)
    .lte("dnc_hold_until", now);

  for (const lead of expiredDncHolds ?? []) {
    await supabase
      .from("leads")
      .update({
        assigned_to: null,
        assigned_at: null,
        assignment_expires_at: null,
        status: "new",
        dnc_hold_until: null,
        shark_tank_status: "open"
      })
      .eq("id", lead.id);

    await supabase.from("communication_history").insert({
      owner_id: lead.owner_id,
      lead_id: lead.id,
      channel: "system_update",
      direction: "system",
      subject: "Lead returned to Shark Tank from DNC hold",
      summary: "Lead returned to Shark Tank from DNC hold",
      occurred_at: now
    });
  }
}
