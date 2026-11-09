import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ResendDeliveryEventRecord {
    email_id: string;
    event_type: string;
    lifecycle_status: string;
    recipient: string;
    subject: string;
    svix_id: string | null;
    timestamp: string;
}

const recentDeliveryEvents: ResendDeliveryEventRecord[] = [];
const MAX_RECENT_EVENTS = 50;

const EVENT_STATUS_MAP: Record<string, string> = {
    "email.sent": "SENT_TO_MTA",
    "email.delivered": "DELIVERED_TO_MAILBOX",
    "email.delivery_delayed": "DELIVERY_DELAYED",
    "email.bounced": "BOUNCED",
    "email.complained": "COMPLAINED_SPAM",
    "email.opened": "RECIPIENT_OPENED",
    "email.clicked": "RECIPIENT_CLICKED",
};

export async function GET() {
    return NextResponse.json({
        service: "FlowMeet Resend Webhook Lifecycle Tracker",
        endpoint: "/api/webhooks/resend",
        note: "POST /emails returns ACCEPTED_BY_RESEND when Resend accepts the dispatch request. Asynchronous mailbox delivery states (DELIVERED_TO_MAILBOX, BOUNCED, DELIVERY_DELAYED) are tracked here via Resend Svix webhooks.",
        supported_events: Object.keys(EVENT_STATUS_MAP),
        recent_events_count: recentDeliveryEvents.length,
        recent_events: recentDeliveryEvents.slice(0, 15),
    });
}

export async function POST(req: NextRequest) {
    try {
        const svixId = req.headers.get("svix-id");
        const body = await req.json();

        const eventType: string = body?.type || "email.delivered";
        const data = body?.data || {};
        const emailId: string = data.email_id || body?.email_id || "unknown";
        const recipient: string = Array.isArray(data.to) ? data.to[0] : data.to || "unknown";
        const subject: string = data.subject || "FlowMeet Notification";
        const lifecycleStatus = EVENT_STATUS_MAP[eventType] || "UNKNOWN_EVENT";

        const record: ResendDeliveryEventRecord = {
            email_id: emailId,
            event_type: eventType,
            lifecycle_status: lifecycleStatus,
            recipient,
            subject,
            svix_id: svixId,
            timestamp: body?.created_at || new Date().toISOString(),
        };

        recentDeliveryEvents.unshift(record);
        if (recentDeliveryEvents.length > MAX_RECENT_EVENTS) {
            recentDeliveryEvents.pop();
        }

        return NextResponse.json({
            received: true,
            email_id: emailId,
            event_type: eventType,
            lifecycle_status: lifecycleStatus,
            timestamp: record.timestamp,
        });
    } catch (err: any) {
        return NextResponse.json(
            { received: false, error: err?.message || "Invalid Resend webhook payload" },
            { status: 400 }
        );
    }
}
