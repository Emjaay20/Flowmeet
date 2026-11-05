import {syncSalesforceLifecycle} from "@/app/lib/salesforce-lifecycle";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {timingSafeEqual} from "node:crypto";
import {trackServerEvent} from "@/app/lib/analytics";
import {trackLifecycleEvent} from "@/app/lib/klaviyo";
import {syncLeadToHubSpot} from "@/app/lib/hubspot";
export async function POST(req:Request) {
 const secret=process.env.FLOWMEET_WORKER_SECRET, supplied=req.headers.get("authorization") || "";
 if (!secret) return NextResponse.json({error:"Worker not configured"},{status:503});
 const expected=`Bearer ${secret}`;
 if (Buffer.byteLength(expected)!==Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected),Buffer.from(supplied)))
  return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_KEY!);
 const {data,error}=await db.rpc("claim_flowmeet_event");
 if (error) return NextResponse.json({error:"Could not claim event"},{status:503});
 const row=data?.[0];
 if (!row) return NextResponse.json({processed:0});
 const event=row.payload, results:Record<string,unknown>={...row.results};
 let failed=false;
 // Persist individual outcomes so successful destinations are skipped on retry.
 const run=async(name:string, action:()=>Promise<{status:string}>)=>{
  if (["submitted","synced","skipped_no_consent","consent_or_client_id_missing"].includes((results[name] as any)?.status)) return;
  try { results[name]=await action(); }
  catch {results[name]={status:"failed"};failed=true;}
  const {error:saveError}=await db.from("integration_events").update({results,updated_at:new Date().toISOString()}).eq("id",row.id);
  if (saveError) throw new Error("Could not persist destination result");
 };
 try {
  await run("ga4",async()=>{
   const name=event.type==="meeting.booked"?"book_meeting":event.type==="customer.activated"?"customer_activated":"generate_lead";
   if(event.type==="meeting.cancelled") return {status:"skipped_no_consent"};
   const result=await trackServerEvent({name,clientId:event.clientId,analyticsConsent:event.analyticsConsent===true});
   if(result.status==="failed") throw new Error();return {status:result.status};
  });
  await run("klaviyo",()=>trackLifecycleEvent({id:event.id,name:event.type,email:event.email,occurredAt:event.occurredAt,marketingConsent:event.marketingConsent===true}));
  await run("salesforce",()=>syncSalesforceLifecycle(event));
  await run("hubspot",async()=>{
   const result=await syncLeadToHubSpot({email:event.email,company:typeof event.company==="string"?event.company:"",domain:event.email.split("@")[1]});
   if(!result.success && process.env.HUBSPOT_ACCESS_TOKEN) throw new Error();
   return {status:result.synced?"synced":"not_configured",contactId:result.contactId};
  });
  const {error:finishError}=await db.from("integration_events").update({results,status:failed?(row.attempts>=5?"failed":"pending"):"completed",available_at:new Date(Date.now()+Math.min(3600,30*2**row.attempts)*1000).toISOString(),updated_at:new Date().toISOString()}).eq("id",row.id);
  if(finishError) throw new Error();
  return NextResponse.json({processed:1,id:row.id,status:failed?"retry_or_failed":"completed",results});
 }catch{return NextResponse.json({error:"Processing interrupted; event will be reclaimed after lease expires"},{status:503});}
}
