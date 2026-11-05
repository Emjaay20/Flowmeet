export interface GA4EventPayload {
 name: "generate_lead" | "book_meeting" | "qualified_account_detected" | "customer_activated";
 clientId?: string;
 analyticsConsent?: boolean;
 params?: Record<string, unknown>;
}
export async function trackServerEvent(event: GA4EventPayload) {
 const id = process.env.GA4_MEASUREMENT_ID, secret = process.env.GA4_API_SECRET;
 if (!id || !secret) return {success:false, dispatched:false, status:"not_configured"};
 if (!event.analyticsConsent || !event.clientId) return {success:false, dispatched:false, status:"consent_or_client_id_missing"};
 // Explicit allowlist prevents email, company names and arbitrary user input entering GA4.
 const params = Object.fromEntries(Object.entries(event.params || {}).filter(([k,v]) =>
   ["icp_score", "engagement_time_msec", "session_id"].includes(k) && typeof v === "number" && Number.isFinite(v)));
 try {
   const res = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(id)}&api_secret=${encodeURIComponent(secret)}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({client_id:event.clientId, events:[{name:event.name,params}]}), signal:AbortSignal.timeout(5000)
   });
   return {success:res.ok, dispatched:res.ok, status:res.ok ? "submitted" : "failed"};
 } catch { return {success:false,dispatched:false,status:"failed"}; }
}
