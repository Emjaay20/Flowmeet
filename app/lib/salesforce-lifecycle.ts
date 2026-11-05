import {createHash} from 'node:crypto';
import {getSalesforceAccessToken} from './salesforce';
export async function syncSalesforceLifecycle(event: {
 id:string;workspaceId:string;email:string;company?:string;type:string;
 startDateTime?:string;endDateTime?:string;meetingUrl?:string;
}) {
 const auth=await getSalesforceAccessToken();
 if(!auth) return {status:'not_configured'};
 // Custom unique external-ID fields must be provisioned before activation.
 const leadKey=createHash('sha256').update(`${event.workspaceId}:${event.email.toLowerCase()}`).digest('hex');
 const base=`${auth.instanceUrl}/services/data/v59.0/sobjects`;
 const request=async(path:string,body?:unknown)=>{
  const response=await fetch(`${base}/${path}`,{method:body?'PATCH':'GET',headers:{Authorization:`Bearer ${auth.accessToken}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000)});
  if(!response.ok) throw new Error(`Salesforce request failed (${response.status})`);
  return response.status===204?null:response.json();
 };
 await request(`Lead/FlowMeet_Lead_ID__c/${leadKey}`,{LastName:event.company || 'Inbound lead',Company:event.company || 'Not provided',Email:event.email});
 const lead=await request(`Lead/FlowMeet_Lead_ID__c/${leadKey}?fields=Id,OwnerId`);
 if(!lead?.Id) throw new Error('Salesforce lead identity was not confirmed');
 if(event.type==='meeting.booked') {
  if(!event.startDateTime || !event.endDateTime || !event.meetingUrl || Date.parse(event.endDateTime)<=Date.parse(event.startDateTime)) throw new Error('Verified meeting details required');
  const key=createHash('sha256').update(`${event.workspaceId}:${event.id}`).digest('hex');
  await request(`Event/FlowMeet_Event_ID__c/${key}`,{Subject:'FlowMeet customer meeting',WhoId:lead.Id,OwnerId:lead.OwnerId,StartDateTime:event.startDateTime,EndDateTime:event.endDateTime,Description:`Confirmed calendar meeting: ${event.meetingUrl}`});
 }
 return {status:'synced',recordId:lead.Id};
}
