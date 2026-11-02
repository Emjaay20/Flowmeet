import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { matchOrCreateSalesforceRecord, createSalesforceEvent } from "@/app/lib/salesforce";
import { syncLeadToHubSpot } from "@/app/lib/hubspot";
import { triggerClayEnrichment } from "@/app/lib/clay";
import { trackServerEvent } from "@/app/lib/analytics";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY || "re_test_mock_secret");
const fromEmail = process.env.EMAIL_FROM || "Flowmeet Concierge <meetings@yusufsaka.dev>";
const adminEmail = process.env.ADMIN_EMAIL || "yusuf@yusufsaka.dev";

function generateIcs(summary: string, description: string, location: string, slotText: string) {
    // Generate a RFC 5545 iCalendar format string
    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    // Default to tomorrow 15:00 UTC if parsing arbitrary strings
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setUTCHours(15, 0, 0, 0);
    const dtstart = tomorrow.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const tomorrowEnd = new Date(tomorrow.getTime() + 30 * 60 * 1000);
    const dtend = tomorrowEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Flowmeet Inc//Inbound Discovery//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:flowmeet-${Date.now()}@yusufsaka.dev`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${location}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Flowmeet Inbound Meeting in 15 minutes",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            slot = "Tomorrow 11:00 AM EST",
            repName = "Yusuf Abubakar",
            repTitle = "Founder & Lead Systems Architect",
            repEmail = "yusuf@yusufsaka.dev",
            company = "Enterprise Lead",
            domain = "prospect.com",
            icpScore = 99
        } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const meetingUrl = "https://meet.google.com/flw-meet-live";
        const meetingSummary = `Flowmeet Discovery • ${company} & ${repName}`;
        const meetingDescription = `Inbound architecture discussion regarding Flowmeet revenue acceleration for ${company} (${domain}).\n\nGoogle Meet Link: ${meetingUrl}\nAssigned Rep: ${repName} (${repEmail})`;

        const icsContent = generateIcs(meetingSummary, meetingDescription, meetingUrl, slot);
        const icsBase64 = Buffer.from(icsContent).toString("base64");

        // 1. Dispatch confirmation email to the prospect
        const prospectEmail = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: `Confirmed: Flowmeet Inbound Discovery — ${slot}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbfa; color: #18181b; padding: 24px; }
                    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .logo { font-size: 18px; font-weight: bold; color: #09090b; letter-spacing: -0.5px; margin-bottom: 24px; }
                    .badge { display: inline-block; padding: 4px 10px; background: #ecfdf5; color: #065f46; font-size: 11px; font-family: monospace; font-weight: bold; border-radius: 9999px; border: 1px solid #a7f3d0; margin-bottom: 16px; }
                    h1 { font-size: 22px; font-weight: bold; color: #09090b; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px; }
                    p { font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 16px; }
                    .details-box { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
                    .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .details-row:last-child { margin-bottom: 0; }
                    .details-label { color: #71717a; font-family: monospace; }
                    .details-value { font-weight: 600; color: #09090b; }
                    .cta-btn { display: inline-block; background: #09090b; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-top: 12px; text-align: center; }
                    .footer { margin-top: 32px; font-size: 11px; color: #a1a1aa; text-align: center; font-family: monospace; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo">Flowmeet • Inbound Handoff</div>
                    <div class="badge">MEETING CONFIRMED</div>
                    <h1>Your Discovery Session is Locked</h1>
                    <p>Hi there, thank you for requesting a demo with Flowmeet. We have pre-qualified your domain and scheduled your dedicated technical walkthrough.</p>
                    
                    <div class="details-box">
                      <div class="details-row">
                        <span class="details-label">Time Slot:</span>
                        <span class="details-value">${slot}</span>
                      </div>
                      <div class="details-row">
                        <span class="details-label">Assigned Rep:</span>
                        <span class="details-value">${repName} (${repTitle})</span>
                      </div>
                      <div class="details-row">
                        <span class="details-label">Account:</span>
                        <span class="details-value">${company} (${domain})</span>
                      </div>
                      <div class="details-row">
                        <span class="details-label">Video Bridge:</span>
                        <span class="details-value"><a href="${meetingUrl}" style="color: #0284c7;">Join Google Meet</a></span>
                      </div>
                    </div>

                    <p>A calendar invitation file (<strong>meeting-invite.ics</strong>) has been attached to this email. You can click below to join the call at the scheduled time:</p>
                    
                    <a href="${meetingUrl}" class="cta-btn">Join Video Room →</a>

                    <div class="footer">
                      Flowmeet Deterministic Revenue Acceleration • yusufsaka.dev
                    </div>
                  </div>
                </body>
                </html>
            `,
            attachments: [
                {
                    filename: "meeting-invite.ics",
                    content: icsBase64
                }
            ]
        });

        // 2. Dispatch real-time alert to Yusuf
        if (adminEmail && adminEmail !== email) {
            await resend.emails.send({
                from: fromEmail,
                to: [adminEmail],
                subject: `🚀 New Lead Booked: ${email} (${company}) — ${slot}`,
                html: `
                    <h2>New Meeting Reserved via Flowmeet Demo</h2>
                    <p><strong>Prospect Email:</strong> ${email}</p>
                    <p><strong>Company:</strong> ${company} (${domain})</p>
                    <p><strong>ICP Score:</strong> ${icpScore}/100</p>
                    <p><strong>Reserved Slot:</strong> ${slot}</p>
                    <p><strong>Assigned AE:</strong> ${repName}</p>
                    <p><strong>Google Meet Room:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>
                `
            });
        }

        // 3. Sync to Salesforce CRM (Lead-to-Account Matching & Event Creation)
        let sfdcLeadSync: any = null;
        let sfdcEventSync: any = null;
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        tomorrow.setUTCHours(15, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow.getTime() + 30 * 60 * 1000);

        try {
            sfdcLeadSync = await matchOrCreateSalesforceRecord({
                email,
                company,
                domain,
                leadSource: "Flowmeet Web Concierge",
                icpScore,
                techStack: ["Next.js", "Cloud Infrastructure"],
                territory: "Global Strategic"
            });

            sfdcEventSync = await createSalesforceEvent({
                leadOrContactId: sfdcLeadSync.sfdcRecordId,
                accountId: sfdcLeadSync.objectType === "Account" ? sfdcLeadSync.sfdcRecordId : undefined,
                ownerId: sfdcLeadSync.assignedOwnerId,
                subject: `Flowmeet Demo • ${company} & ${repName}`,
                startDateTime: tomorrow.toISOString(),
                endDateTime: tomorrowEnd.toISOString(),
                description: `Inbound meeting booked via Flowmeet Concierge. Video Bridge: ${meetingUrl}`,
                meetingUrl
            });
        } catch (sfErr) {
            console.warn("Salesforce sync error in book-slot:", sfErr);
        }

        // 4. Sync to HubSpot Free CRM
        let hubspotSync: any = null;
        try {
            hubspotSync = await syncLeadToHubSpot({
                email,
                company,
                domain,
                icpScore,
                dealARR: 65000,
                meetingSlot: slot
            });
        } catch (hsErr) {
            console.warn("HubSpot sync error in book-slot:", hsErr);
        }

        // 5. Trigger Clay Waterfall Enrichment Webhook
        let claySync: any = null;
        try {
            claySync = await triggerClayEnrichment({
                email,
                domain,
                company,
                icpScore,
                source: "flowmeet_demo_modal"
            });
        } catch (clayErr) {
            console.warn("Clay enrichment dispatch error:", clayErr);
        }

        // 6. Server-side Google Analytics 4 (GA4) Conversion Event
        try {
            await trackServerEvent({
                name: "book_meeting",
                params: {
                    lead_email: email,
                    company,
                    domain,
                    icp_score: icpScore,
                    value: 65000,
                    currency: "USD",
                    meeting_slot: slot,
                    rep_assigned: repName
                }
            });
        } catch (gaErr) {
            console.warn("GA4 event dispatch notice:", gaErr);
        }

        return NextResponse.json({
            success: true,
            id: prospectEmail.data?.id,
            slot,
            repName,
            recipient: email,
            salesforce: {
                leadOrAccount: sfdcLeadSync,
                event: sfdcEventSync
            },
            hubspot: hubspotSync,
            clay: claySync,
            ga4: { tracked: true }
        });

    } catch (err: any) {
        console.error("Book slot error:", err);
        return NextResponse.json({ error: err.message || "Failed to dispatch booking" }, { status: 500 });
    }
}
