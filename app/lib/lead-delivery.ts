import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "./email";
import { escapeHtml } from "./lead-capture";

/** Reserve a durable delivery record before sending. Replays never send again. */
export async function deliverBookingEmail(db: SupabaseClient, workspaceId: string, lead: { id: string; email: string; name: string | null; booking_url: string }) {
    const eventId = `lead-delivery:${lead.id}`;
    const started = { status: "dispatching", email_id: null as string | null };
    const { error: reserve } = await db.from("integration_events").insert({
        id: eventId, workspace_id: workspaceId, type: "email.dispatched", status: "completed",
        payload: { lead_id: lead.id, recipient: lead.email }, results: { delivery: started },
    });
    if (reserve?.code === "23505") {
        const { data, error } = await db.from("integration_events").select("results").eq("id", eventId).eq("workspace_id", workspaceId).single();
        if (error) throw new Error("Could not read delivery state");
        return data.results.delivery;
    }
    if (reserve) throw new Error("Could not reserve delivery; no email sent");
    let delivery: { status: string; email_id: string | null };
    try {
        const response = await sendEmail({ to: lead.email, subject: lead.name?.startsWith("[TEST]") ? "[TEST] FlowMeet booking link — acceptance check" : "Your FlowMeet meeting booking link",
            html: `<p>Hello ${escapeHtml(lead.name || "there")},</p><p>Your enquiry has been saved. Choose a time that works for you:</p><p><a href="${escapeHtml(lead.booking_url)}">Choose a meeting time</a></p><p>A meeting is confirmed only after you complete the calendar provider's booking process.</p>`,
            idempotencyKey: eventId,
            tags: [{ name: "workspace_id", value: workspaceId }, { name: "lead_id", value: lead.id }],
        });
        delivery = { status: "accepted", email_id: response.data!.id };
    } catch {
        // A timeout can happen after provider acceptance. Do not automatically retry an uncertain send.
        delivery = { status: "unconfirmed", email_id: null };
    }
    const { error } = await db.from("integration_events").update({
        results: { delivery }, payload: { lead_id: lead.id, recipient: lead.email, email_id: delivery.email_id }, updated_at: new Date().toISOString(),
    }).eq("id", eventId).eq("workspace_id", workspaceId);
    if (error) throw new Error("Delivery result needs reconciliation; do not submit a new delivery request");
    if (delivery.email_id) {
        const { error: binding } = await db.from("integration_events").upsert({
            id: `resend-msg:${delivery.email_id}`, workspace_id: workspaceId, type: "email.dispatched", status: "completed",
            payload: { email_id: delivery.email_id, lead_id: lead.id }, results: {},
        });
        if (binding) throw new Error("Delivery accepted but tracking binding needs reconciliation");
    }
    return delivery;
}
