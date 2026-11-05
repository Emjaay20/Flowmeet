import {NextResponse} from 'next/server';
import {createClient} from '@/app/lib/supabase/server';
export async function GET() {
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data:membership,error}=await db.from('workspace_users').select('workspace_id,role').eq('user_id',user.id).eq('workspace_id',process.env.FLOWMEET_PILOT_WORKSPACE_ID || '00000000-0000-0000-0000-000000000000').single();
 if(error || membership?.role!=='admin') return NextResponse.json({error:'Pilot workspace administrator required'},{status:403});
 const configured=(...keys:string[])=>keys.every(key=>!!process.env[key]);
 return NextResponse.json({mode:'single_workspace_pilot',providers:{
  calendar:{configured:configured('FLOWMEET_BOOKING_URL'),verified:false},
  salesforce:{configured:configured('SALESFORCE_CLIENT_ID','SALESFORCE_CLIENT_SECRET') || configured('SALESFORCE_ACCESS_TOKEN','SALESFORCE_INSTANCE_URL'),verified:false},
  hubspot:{configured:configured('HUBSPOT_ACCESS_TOKEN'),verified:false},
  firecrawl:{configured:configured('FIRECRAWL_API_KEY'),verified:false},
  ga4:{configured:configured('GA4_MEASUREMENT_ID','GA4_API_SECRET'),verified:false},
  klaviyo:{configured:configured('KLAVIYO_PRIVATE_API_KEY'),verified:false}
 },notice:'Configured does not mean connected or verified. Verify each provider using a controlled end-to-end test.'},{headers:{'Cache-Control':'no-store'}});
}
