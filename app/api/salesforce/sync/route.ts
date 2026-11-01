import { NextRequest, NextResponse } from "next/server";
import { matchOrCreateSalesforceRecord, createSalesforceEvent } from "@/app/lib/salesforce";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email = "vp@stripe.com",
            company = "Stripe",
            domain = "stripe.com",
            slot = "Tomorrow 11:00 AM EST",
            icpScore = 99,
            techStack = ["Stripe", "Next.js", "Docker"],
            repName = "Yusuf Abubakar"
        } = body;

        // 1. Run Lead-to-Account (L2A) Matching in Salesforce
        const leadSync = await matchOrCreateSalesforceRecord({
            email,
            company,
            domain,
            leadSource: "Flowmeet Web Concierge",
            icpScore,
            techStack,
            territory: "Americas Strategic"
        });

        // 2. Create Salesforce Event for the confirmed meeting
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        tomorrow.setUTCHours(15, 0, 0, 0);
        const startDateTime = tomorrow.toISOString();
        const endDateTime = new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString();

        const eventSync = await createSalesforceEvent({
            leadOrContactId: leadSync.sfdcRecordId,
            accountId: leadSync.objectType === "Account" ? leadSync.sfdcRecordId : undefined,
            ownerId: leadSync.assignedOwnerId,
            subject: `Flowmeet Demo • ${company} & ${repName}`,
            startDateTime,
            endDateTime,
            description: `Automated inbound meeting booked via Flowmeet Concierge.\nEnriched Score: ${icpScore}/100.\nTech: ${techStack.join(", ")}`,
            meetingUrl: "https://meet.google.com/flw-meet-live"
        });

        return NextResponse.json({
            success: true,
            salesforce: {
                leadOrAccount: leadSync,
                calendarEvent: eventSync,
                chiliPiperEquivalents: {
                    formConcierge: "Interception & Real-time DOM Enrichment",
                    distro: "Lead-to-Account (L2A) Ownership Matching",
                    instantBooker: "Salesforce Event Creation & Resend Calendar Sync"
                }
            }
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Salesforce sync failed" }, { status: 500 });
    }
}
