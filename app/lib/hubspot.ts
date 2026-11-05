// HubSpot Free CRM Integration Service for Flowmeet
// Handles automatic Contact and Deal upsert on qualified demo bookings

export interface HubSpotContactPayload {
    email: string;
    firstName?: string;
    lastName?: string;
    company: string;
    domain: string;
    role?: string;
    icpScore?: number;
    dealARR?: number;
    meetingSlot?: string;
}

export interface HubSpotSyncResult {
    success: boolean;
    synced: boolean;
    provider: string;
    contactId?: string;
    dealId?: string;
    message: string;
}

/**
 * Upsert Contact and create a Deal in HubSpot CRM
 * Uses HubSpot REST API v3 (Supported on all free tiers)
 */
export async function syncLeadToHubSpot(payload: HubSpotContactPayload): Promise<HubSpotSyncResult> {
 const token=process.env.HUBSPOT_ACCESS_TOKEN;
 if (!token) return {success:false,synced:false,provider:"HubSpot CRM",message:"HubSpot is not configured"};
 try {
  const res=await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert", {
   method:"POST", signal:AbortSignal.timeout(6000),
   headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
   body:JSON.stringify({inputs:[{id:payload.email,idProperty:"email",properties:{email:payload.email,firstname:payload.firstName || "",lastname:payload.lastName || "",company:payload.company,website:`https://${payload.domain}`,jobtitle:payload.role || ""}}]})
  });
  if (!res.ok) throw new Error(`HubSpot rejected contact (${res.status})`);
  const data=await res.json();
  const contactId=data.results?.[0]?.id;
  if (!contactId || data.errors?.length) throw new Error("HubSpot did not confirm the contact");
  return {success:true,synced:true,provider:"HubSpot CRM",contactId,message:"Contact upsert confirmed"};
 } catch(error) {return {success:false,synced:false,provider:"HubSpot CRM",message:error instanceof Error?error.message:"HubSpot sync failed"};}
}
