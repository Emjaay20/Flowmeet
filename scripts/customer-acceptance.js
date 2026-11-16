// Run inside the gateway after explicit permission for this recipient.
// Re-running uses the same request/delivery/booking identities, preventing duplicate invitations.
const assert = require("node:assert/strict");
if (process.env.FLOWMEET_RUN_LIVE_ACCEPTANCE !== "I_HAVE_RECIPIENT_PERMISSION") throw new Error("Live acceptance requires explicit recipient permission and the FLOWMEET_RUN_LIVE_ACCEPTANCE guard");
const base = "https://flowmeet.aetherhost.com.ng";
const key = process.env.FLOWMEET_ACCEPTANCE_API_KEY;
const workspace = process.env.FLOWMEET_ACCEPTANCE_WORKSPACE_ID;
if (!key || !workspace) throw new Error("Dedicated acceptance workspace is not configured");
const headers = { "Content-Type": "application/json", "x-api-key": key, "Idempotency-Key": "flowmeet_acceptance_20261116_v1" };
const payload = { name: "[TEST] FlowMeet acceptance — no attendance required", email: "yusuf@yusufsaka.dev", company: "FlowMeet acceptance test", role: "Founder", region: "Europe", send_booking_email: true };
async function request(path, body, customHeaders=headers) {
  const response=await fetch(base+path,{method:body===undefined?"GET":"POST",headers:customHeaders,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(50000)});
  return {code:response.status,data:await response.json()};
}
async function database(path) {
  const response=await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+"/rest/v1/"+path,{headers:{apikey:process.env.SUPABASE_SERVICE_KEY,Authorization:"Bearer "+process.env.SUPABASE_SERVICE_KEY}});
  if(!response.ok) throw new Error("Could not inspect acceptance state");
  return response.json();
}
(async()=>{
  let r=await request("/api/leads",payload,{"Content-Type":"application/json"});
  assert.equal(r.code,401); console.log("PASS unauthenticated lead writes rejected");
  r=await request("/api/onboarding",{email:payload.email,user_id:"00000000-0000-0000-0000-000000000000"},{"Content-Type":"application/json"});
  assert.equal(r.code,401); console.log("PASS body-supplied onboarding identities rejected");
  r=await request("/api/leads?via=n8n",payload);
  assert.equal(r.code,200,JSON.stringify(r.data));assert.equal(r.data.orchestrator,"n8n");assert.ok(r.data.n8n_execution_id);
  assert.equal(r.data.lead.workspace_id,workspace);assert.equal(r.data.delivery.status,"accepted",JSON.stringify(r.data.delivery));
  const leadId=r.data.lead.id, emailId=r.data.delivery.email_id;
  console.log(JSON.stringify({check:"n8n persisted lead and provider accepted one email",lead_id:leadId,email_id:emailId,n8n_execution_id:r.data.n8n_execution_id}));
  r=await request("/api/leads",payload);
  assert.equal(r.code,200);assert.equal(r.data.duplicate,true);assert.equal(r.data.lead.id,leadId);assert.equal(r.data.delivery.email_id,emailId);
  console.log("PASS replay uses the same lead and email; no second send");
  r=await request("/api/leads",{...payload,company:"Different payload"});assert.equal(r.code,409);
  console.log("PASS same key with changed input rejected");
  const others=await database("api_keys?select=key&workspace_id=neq."+workspace+"&limit=1");
  if(others.length){ r=await request(`/api/leads/${leadId}/status`,undefined,{"x-api-key":others[0].key});assert.equal(r.code,404);console.log("PASS another workspace cannot read the test lead"); }
  r=await request("/api/webhooks/resend",{type:"email.delivered",data:{email_id:emailId}},{"Content-Type":"application/json"});assert.equal(r.code,401);
  console.log("PASS unsigned delivery callback rejected");
  let deliveryVerified=false;
  for(let i=0;i<20;i++){
    r=await request(`/api/leads/${leadId}/status`);
    if(r.data.verified_delivery_events?.some(e=>e.type==="email.delivered")){deliveryVerified=true;break;}
    await new Promise(resolve=>setTimeout(resolve,2500));
  }
  if(deliveryVerified) console.log("PASS signed provider callback confirms email.delivered in Supabase");
  else {
    const provider=await fetch("https://api.resend.com/emails/"+emailId,{headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY}});
    const data=await provider.json();console.log(JSON.stringify({check:"delivery callback pending",provider_status:provider.status,last_event:data.last_event}));
    throw new Error("Delivery acceptance is recorded but a signed delivered callback has not been observed yet");
  }
  const prior=await database("integration_events?id=eq.calendar-request:"+leadId+"&workspace_id=eq."+workspace+"&select=payload,results");
  let start=prior[0]?.payload?.start;
  if(!start){
    const fmt=date=>new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
    const first=fmt(new Date(Date.now()+86400000)),last=fmt(new Date(Date.now()+4*86400000));
    r=await request(`/api/calendar/slots?start=${first}&end=${last}`);
    assert.equal(r.code,200,JSON.stringify(r.data));
    const slots=Object.values(r.data.data||{}).flat().map(s=>s.start).filter(s=>Date.parse(s)>Date.now()+86400000).sort();
    assert.ok(slots.length,"No available test slots");start=slots[0];
    console.log("PASS fetched real calendar availability");
  }
  r=await request("/api/calendar/book",{lead_id:leadId,start});
  assert.ok([200,201].includes(r.code),JSON.stringify(r.data));assert.equal(r.data.calendar.status,"accepted",JSON.stringify(r.data));
  console.log(JSON.stringify({check:"calendar provider confirmed real test booking",...r.data.calendar}));
  const uid=r.data.calendar.uid;
  r=await request("/api/calendar/book",{lead_id:leadId,start});assert.equal(r.data.duplicate,true);assert.equal(r.data.calendar.uid,uid);
  console.log("PASS booking replay returns the same provider booking");
  r=await request(`/api/leads/${leadId}/status`);assert.equal(r.data.lead.status,"Meeting booked");
  console.log("PASS database records the confirmed meeting");
})().catch(error=>{console.error(error.message);process.exitCode=1;});
