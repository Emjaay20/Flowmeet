export async function trackLifecycleEvent(event: {
 id:string; name:string; email:string; occurredAt:string; marketingConsent:boolean;
}) {
 const key=process.env.KLAVIYO_PRIVATE_API_KEY;
 if (!key) return {status:"not_configured"};
 if (!event.marketingConsent) return {status:"skipped_no_consent"};
 const res=await fetch("https://a.klaviyo.com/api/events", {
  method:"POST", signal:AbortSignal.timeout(5000),
  headers:{Authorization:`Klaviyo-API-Key ${key}`, revision:"2026-10-15", "Content-Type":"application/vnd.api+json", accept:"application/vnd.api+json"},
  body:JSON.stringify({data:{type:"event", attributes:{unique_id:event.id,time:event.occurredAt,properties:{source:"flowmeet"},metric:{data:{type:"metric",attributes:{name:event.name}}},profile:{data:{type:"profile",attributes:{email:event.email}}}}}})
 });
 if (!res.ok) throw new Error(`Klaviyo rejected event (${res.status})`);
 return {status:"submitted"}; // Accepted for processing, not delivery or subscription confirmation.
}
