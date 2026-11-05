import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {parseCalcomEvent} from '@/app/lib/calcom-event';
export async function POST(req:Request) {
 const secret=process.env.CALCOM_WEBHOOK_SECRET,workspace=process.env.FLOWMEET_PILOT_WORKSPACE_ID;
 const typeId=Number(process.env.CALCOM_EVENT_TYPE_ID);
 if(!secret || !workspace || !Number.isInteger(typeId) || typeId<=0) return NextResponse.json({error:'Calendar webhook not configured'},{status:503});
 const raw=await req.text();
 if(Buffer.byteLength(raw)>131072) return NextResponse.json({error:'Payload too large'},{status:413});
 let event;
 try {event=parseCalcomEvent(raw,req.headers.get('x-cal-signature-256'),secret,workspace,typeId);}
 catch{return NextResponse.json({error:'Invalid signed calendar event'},{status:400});}
 if(!event) return NextResponse.json({ignored:true});
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_KEY!);
 const {error}=await db.from('integration_events').insert({id:event.id,workspace_id:workspace,type:event.type,payload:event});
 if(error?.code==='23505') return NextResponse.json({accepted:true,duplicate:true});
 if(error) return NextResponse.json({error:'Booking could not be persisted'},{status:503});
 return NextResponse.json({accepted:true,status:'pending'},{status:202});
}
