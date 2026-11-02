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
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!accessToken) {
        return {
            success: true,
            synced: false,
            provider: "HubSpot CRM",
            message: "HUBSPOT_ACCESS_TOKEN not set. Lead saved to PostgreSQL; HubSpot ready for plug-and-play."
        };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        // 1. Create or Update Contact in HubSpot
        const contactRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                properties: {
                    email: payload.email,
                    firstname: payload.firstName || payload.email.split("@")[0],
                    company: payload.company,
                    website: `https://${payload.domain}`,
                    jobtitle: payload.role || "Inbound Lead",
                    hs_lead_status: "QUALIFIED",
                    notes_last_contacted: `Flowmeet Booked Demo: ${payload.meetingSlot || "Pending"}`
                }
            }),
            signal: controller.signal
        });

        let contactId: string | undefined;

        if (contactRes.ok) {
            const data = await contactRes.json();
            contactId = data.id;
        } else if (contactRes.status === 409) {
            // Contact already exists, extract existing ID
            const errData = await contactRes.json();
            const match = errData?.message?.match(/ID: (\d+)/);
            if (match) contactId = match[1];
        }

        // 2. Optionally create Deal if Contact was resolved and deal ARR exists
        let dealId: string | undefined;
        if (contactId && payload.dealARR) {
            const dealRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    properties: {
                        dealname: `${payload.company} - Flowmeet Inbound Deal`,
                        amount: payload.dealARR.toString(),
                        dealstage: "appointmentscheduled",
                        pipeline: "default"
                    }
                })
            });

            if (dealRes.ok) {
                const dealData = await dealRes.json();
                dealId = dealData.id;
            }
        }

        clearTimeout(timeout);

        return {
            success: true,
            synced: true,
            provider: "HubSpot CRM",
            contactId,
            dealId,
            message: `Lead successfully synced to HubSpot Contact ${contactId || ""}`
        };
    } catch (err: any) {
        return {
            success: false,
            synced: false,
            provider: "HubSpot CRM",
            message: `HubSpot sync error: ${err.message}`
        };
    }
}
