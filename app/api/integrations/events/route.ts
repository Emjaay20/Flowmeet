import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {verifyEventSignature} from "@/app/lib/event-signature";
// Server-to-server events only; credentials are scoped to one explicitly configured pilot workspace.
export async function POST(req:Request) {
 const secret=process.env.FLOWMEET_EVENT_SECRET, workspace=process.env.FLOWMEET_PILOT_WORKSPACE_ID;
 if (!secret || !workspace) return NextResponse.json({error:"Event integration not configured"},{status:503});
 const raw=await req.text();
 if (raw.length>16384) return NextResponse.json({error:"Payload too large"},{status:413});
 if (!verifyEventSignature(raw,req.headers.get("x-event-timestamp"),req.headers.get("x-event-signature"),secret))
  return NextResponse.json({error:"Invalid event signature"},{status:401});
 let event;
 try {event=JSON.parse(raw);} catch {return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if (!event || typeof event.id!=="string" || !/^[a-zA-Z0-9_-]{8,128}$/.test(event.id) ||
  !["lead.qualified","meeting.booked","meeting.cancelled","customer.activated"].includes(event.type) ||
  typeof event.occurredAt!=="string" || !Number.isFinite(Date.parse(event.occurredAt)) ||
  event.workspaceId!==workspace || typeof event.email!=="string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.email))
  return NextResponse.json({error:"Invalid lifecycle event"},{status:400});
 if(event.type==="meeting.booked" && (typeof event.startDateTime!=="string" || typeof event.endDateTime!=="string" || !Number.isFinite(Date.parse(event.startDateTime)) || !Number.isFinite(Date.parse(event.endDateTime)) || Date.parse(event.endDateTime)<=Date.parse(event.startDateTime) || typeof event.meetingUrl!=="string" || !event.meetingUrl.startsWith("https://")))
  return NextResponse.json({error:"Confirmed meeting times and HTTPS meeting URL required"},{status:400});
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_KEY!);
 const {error}=await db.from("integration_events").insert({id:event.id,workspace_id:workspace,type:event.type,payload:event});
 if (error?.code==="23505") return NextResponse.json({accepted:true,duplicate:true});
 if (error) return NextResponse.json({error:"Event could not be persisted"},{status:503});
 return NextResponse.json({accepted:true,status:"pending"},{status:202});
}
