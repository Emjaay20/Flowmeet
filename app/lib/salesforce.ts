/**
 * Salesforce CRM Data Model & REST API Integration Service
 * 
 * Designed to mirror Chili Piper's Form Concierge & Distro Salesforce Managed Package.
 * Implements Lead-to-Account (L2A) matching, standard/custom object mapping,
 * and automated Event creation for booked meetings.
 */

export interface SalesforceLeadPayload {
    firstName?: string;
    lastName?: string;
    company: string;
    email: string;
    domain: string;
    title?: string;
    leadSource: string;
    icpScore: number;
    techStack: string[];
    territory: string;
}

export interface SalesforceEventPayload {
    leadOrContactId: string;
    accountId?: string;
    ownerId: string; // Salesforce User ID of assigned Sales Rep
    subject: string;
    startDateTime: string;
    endDateTime: string;
    description: string;
    meetingUrl: string;
}

export interface SalesforceSyncResult {
    sfdcRecordId: string;
    objectType: "Lead" | "Contact" | "Account" | "Event";
    action: "CREATED" | "UPDATED" | "MATCHED";
    assignedOwnerId: string;
    soqlQueryExecuted?: string;
    latencyMs: number;
    simulated: boolean;
}

/**
 * Lead-to-Account (L2A) Matching & Routing
 * 
 * Queries Salesforce via SOQL to find an existing Account by corporate domain.
 * If found, routes directly to the existing Account Owner (Chili Piper Distro model).
 * If not found, creates a new Lead and routes via Round-Robin.
 */
export async function matchOrCreateSalesforceRecord(lead: SalesforceLeadPayload): Promise<SalesforceSyncResult> {
    const startTime = Date.now();
    
    // SOQL query pattern used by Chili Piper Managed Package
    const soqlAccountMatch = `SELECT Id, Name, OwnerId, Owner.Name, Owner.Email FROM Account WHERE Website LIKE '%${lead.domain}%' OR Name = '${lead.company}' LIMIT 1`;

    // Check if live Salesforce OAuth environment variables are present
    const sfdcInstanceUrl = process.env.SALESFORCE_INSTANCE_URL;
    const sfdcAccessToken = process.env.SALESFORCE_ACCESS_TOKEN;

    if (sfdcInstanceUrl && sfdcAccessToken) {
        try {
            // 1. Live SOQL Query to Salesforce REST API
            const queryRes = await fetch(`${sfdcInstanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(soqlAccountMatch)}`, {
                headers: {
                    "Authorization": `Bearer ${sfdcAccessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (queryRes.ok) {
                const queryData = await queryRes.json();
                if (queryData.records && queryData.records.length > 0) {
                    const matchedAccount = queryData.records[0];
                    return {
                        sfdcRecordId: matchedAccount.Id,
                        objectType: "Account",
                        action: "MATCHED",
                        assignedOwnerId: matchedAccount.OwnerId,
                        soqlQueryExecuted: soqlAccountMatch,
                        latencyMs: Date.now() - startTime,
                        simulated: false
                    };
                }
            }

            // 2. No existing Account -> Create new Lead via Salesforce REST API
            const createLeadRes = await fetch(`${sfdcInstanceUrl}/services/data/v59.0/sobjects/Lead`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sfdcAccessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    FirstName: lead.firstName || "Inbound",
                    LastName: lead.lastName || lead.company,
                    Company: lead.company,
                    Email: lead.email,
                    Title: lead.title || "Unknown",
                    LeadSource: lead.leadSource,
                    Rating: lead.icpScore >= 80 ? "Hot" : lead.icpScore >= 60 ? "Warm" : "Cold",
                    Status: "Open - Not Contacted",
                    Description: `Enriched via Flowmeet. Tech: ${lead.techStack.join(", ")}. ICP Score: ${lead.icpScore}/100.`,
                    // Custom fields typically installed via Chili Piper managed package:
                    ChiliPiper_ICP_Score__c: lead.icpScore,
                    ChiliPiper_Routed_Territory__c: lead.territory
                })
            });

            if (createLeadRes.ok) {
                const leadData = await createLeadRes.json();
                return {
                    sfdcRecordId: leadData.id,
                    objectType: "Lead",
                    action: "CREATED",
                    assignedOwnerId: "0058Z000008xX4KQAU",
                    soqlQueryExecuted: soqlAccountMatch,
                    latencyMs: Date.now() - startTime,
                    simulated: false
                };
            }
        } catch (err) {
            console.warn("Live Salesforce API call failed, falling back to simulated engine:", err);
        }
    }

    // Deterministic simulation for demo/interview portfolio showcase
    const isMatchedDomain = ["stripe.com", "linear.app", "github.com", "automattic.com"].includes(lead.domain.toLowerCase());

    return {
        sfdcRecordId: isMatchedDomain ? "0018Z00003A4xK1QAJ" : "00Q8Z000021rY7UQAU",
        objectType: isMatchedDomain ? "Account" : "Lead",
        action: isMatchedDomain ? "MATCHED" : "CREATED",
        assignedOwnerId: isMatchedDomain ? "0058Z000009yY4KQAU (Account Owner)" : "0058Z000008xX4KQAU (Round Robin)",
        soqlQueryExecuted: soqlAccountMatch,
        latencyMs: Math.floor(Math.random() * 25 + 18),
        simulated: true
    };
}

/**
 * Sync Confirmed Calendar Meeting into Salesforce Event Object
 * 
 * Mirrors Chili Piper's Event creation:
 * - WhoId: Lead or Contact ID
 * - WhatId: Account or Opportunity ID (if matched)
 * - StartDateTime / EndDateTime: UTC meeting window
 * - ActivityDateTime: Time meeting was booked
 */
export async function createSalesforceEvent(eventData: SalesforceEventPayload): Promise<SalesforceSyncResult> {
    const startTime = Date.now();
    const sfdcInstanceUrl = process.env.SALESFORCE_INSTANCE_URL;
    const sfdcAccessToken = process.env.SALESFORCE_ACCESS_TOKEN;

    const eventPayload = {
        Subject: eventData.subject,
        WhoId: eventData.leadOrContactId.startsWith("00Q") ? eventData.leadOrContactId : undefined,
        WhatId: eventData.accountId?.startsWith("001") ? eventData.accountId : undefined,
        OwnerId: eventData.ownerId.startsWith("005") ? eventData.ownerId : "0058Z000008xX4KQAU",
        StartDateTime: eventData.startDateTime,
        EndDateTime: eventData.endDateTime,
        Description: `${eventData.description}\n\nVideo Bridge: ${eventData.meetingUrl}`,
        Type: "Meeting",
        EventSubtype: "Event"
    };

    if (sfdcInstanceUrl && sfdcAccessToken) {
        try {
            const res = await fetch(`${sfdcInstanceUrl}/services/data/v59.0/sobjects/Event`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sfdcAccessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventPayload)
            });

            if (res.ok) {
                const data = await res.json();
                return {
                    sfdcRecordId: data.id,
                    objectType: "Event",
                    action: "CREATED",
                    assignedOwnerId: eventData.ownerId,
                    latencyMs: Date.now() - startTime,
                    simulated: false
                };
            }
        } catch (err) {
            console.warn("Live Salesforce Event creation failed, falling back to simulated response:", err);
        }
    }

    return {
        sfdcRecordId: "00U8Z000005aB2zQAE",
        objectType: "Event",
        action: "CREATED",
        assignedOwnerId: eventData.ownerId,
        latencyMs: Math.floor(Math.random() * 20 + 15),
        simulated: true
    };
}
