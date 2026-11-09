import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const EVENT_STATUS_MAP: Record<string, string> = {
    "email.sent": "SENT_TO_MTA",
    "email.delivered": "DELIVERED_TO_MAILBOX",
    "email.delivery_delayed": "DELIVERY_DELAYED",
    "email.bounced": "BOUNCED",
    "email.complained": "COMPLAINED_SPAM",
    "email.opened": "RECIPIENT_OPENED",
    "email.clicked": "RECIPIENT_CLICKED",
};

const processedSvixIds = new Set<string>();
const fallbackCounts: Record<string, number> = {
    SENT_TO_MTA: 0,
    DELIVERED_TO_MAILBOX: 0,
    DELIVERY_DELAYED: 0,
    BOUNCED: 0,
    COMPLAINED_SPAM: 0,
    RECIPIENT_OPENED: 0,
    RECIPIENT_CLICKED: 0,
};

function verifySvixSignature(
    rawBody: string,
    svixId: string | null,
    svixTimestamp: string | null,
    svixSignature: string | null,
    secret: string,
    nowMs = Date.now()
): boolean {
    if (!svixId || !svixTimestamp || !svixSignature) {
        return false;
    }
    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(svixId) || !/^\d+$/.test(svixTimestamp)) {
        return false;
    }

    const timestampSeconds = Number(svixTimestamp);
    if (!Number.isFinite(timestampSeconds) || Math.abs(nowMs - timestampSeconds * 1000) > 300_000) {
        return false;
    }

    const secretKey = secret.startsWith("whsec_")
        ? Buffer.from(secret.slice(6), "base64")
        : Buffer.from(secret, "utf8");

    if (secretKey.length === 0) {
        return false;
    }

    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expectedSignature = createHmac("sha256", secretKey).update(signedContent).digest();

    const candidateSignatures = svixSignature.trim().split(/\s+/);
    for (const candidate of candidateSignatures) {
        const [version, base64Sig] = candidate.split(",");
        if (version !== "v1" || !base64Sig) {
            continue;
        }
        try {
            const candidateBytes = Buffer.from(base64Sig, "base64");
            if (
                candidateBytes.length === expectedSignature.length &&
                timingSafeEqual(expectedSignature, candidateBytes)
            ) {
                return true;
            }
        } catch {
            continue;
        }
    }

    return false;
}

export async function GET() {
    const counts: Record<string, number> = {
        SENT_TO_MTA: fallbackCounts.SENT_TO_MTA,
        DELIVERED_TO_MAILBOX: fallbackCounts.DELIVERED_TO_MAILBOX,
        DELIVERY_DELAYED: fallbackCounts.DELIVERY_DELAYED,
        BOUNCED: fallbackCounts.BOUNCED,
        COMPLAINED_SPAM: fallbackCounts.COMPLAINED_SPAM,
        RECIPIENT_OPENED: fallbackCounts.RECIPIENT_OPENED,
        RECIPIENT_CLICKED: fallbackCounts.RECIPIENT_CLICKED,
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
        try {
            const db = createClient(supabaseUrl, supabaseServiceKey);
            const { data } = await db
                .from("integration_events")
                .select("type")
                .in("type", Object.keys(EVENT_STATUS_MAP));

            if (Array.isArray(data)) {
                for (const key of Object.keys(counts)) {
                    counts[key] = 0;
                }
                for (const row of data) {
                    const status = EVENT_STATUS_MAP[row.type];
                    if (status) {
                        counts[status] = (counts[status] || 0) + 1;
                    }
                }
            }
        } catch {
            // Fall back to in-memory counts if DB query fails
        }
    }

    let totalVerifiedEvents = 0;
    for (const count of Object.values(counts)) {
        totalVerifiedEvents += count;
    }

    return NextResponse.json(
        {
            service: "FlowMeet Resend Webhook Lifecycle Tracker",
            endpoint: "/api/webhooks/resend",
            security: {
                signature_verification: "SVIX_HMAC_SHA256_REQUIRED",
                replay_window_seconds: 300,
                deduplication: "SVIX_ID_IDEMPOTENT_SUPABASE",
                public_exposure: "AGGREGATE_COUNTS_ONLY_NO_PII",
            },
            supported_events: Object.keys(EVENT_STATUS_MAP),
            total_verified_events: totalVerifiedEvents,
            lifecycle_counts: counts,
        },
        {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        }
    );
}

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json(
            { received: false, error: "Resend webhook signing secret not configured" },
            { status: 503 }
        );
    }

    const rawBody = await req.text();
    if (rawBody.length === 0 || rawBody.length > 32_768) {
        return NextResponse.json(
            { received: false, error: "Invalid webhook payload size" },
            { status: 413 }
        );
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, webhookSecret)) {
        return NextResponse.json(
            { received: false, error: "Unauthorized: Invalid or expired Svix webhook signature" },
            { status: 401 }
        );
    }

    let body: any;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return NextResponse.json(
            { received: false, error: "Invalid JSON payload" },
            { status: 400 }
        );
    }

    const eventType = typeof body?.type === "string" ? body.type : "";
    const lifecycleStatus = EVENT_STATUS_MAP[eventType];
    const emailId = typeof body?.data?.email_id === "string" ? body.data.email_id.trim() : "";

    if (!lifecycleStatus || !emailId) {
        return NextResponse.json(
            {
                received: false,
                error: "Unsupported event type or missing data.email_id",
            },
            { status: 400 }
        );
    }

    // Event-ID Deduplication (In-Memory Fast Path)
    if (processedSvixIds.has(svixId!)) {
        return NextResponse.json({
            received: true,
            duplicate: true,
            svix_id: svixId,
            lifecycle_status: lifecycleStatus,
        });
    }

    // Persist to Supabase with Event-ID Deduplication (PostgreSQL Unique Constraint 23505)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    let workspaceId =
        process.env.FOUNDER_WORKSPACE_ID ||
        process.env.FLOWMEET_PILOT_WORKSPACE_ID;

    let persistedToSupabase = false;
    if (supabaseUrl && supabaseServiceKey) {
        try {
            const db = createClient(supabaseUrl, supabaseServiceKey);
            if (!workspaceId) {
                const { data: wsRow } = await db
                    .from("workspace_users")
                    .select("workspace_id")
                    .limit(1)
                    .single();
                workspaceId = wsRow?.workspace_id;
            }

            if (workspaceId) {
                const { error } = await db.from("integration_events").insert({
                    id: svixId!,
                    workspace_id: workspaceId,
                    type: eventType,
                    status: "completed",
                    payload: {
                        svix_id: svixId,
                        email_id: emailId,
                        event_type: eventType,
                        lifecycle_status: lifecycleStatus,
                        created_at: body?.created_at || new Date().toISOString(),
                    },
                });

                if (error?.code === "23505") {
                    processedSvixIds.add(svixId!);
                    return NextResponse.json({
                        received: true,
                        duplicate: true,
                        persisted: true,
                        svix_id: svixId,
                        lifecycle_status: lifecycleStatus,
                    });
                }
                persistedToSupabase = !error;
            }
        } catch {
            persistedToSupabase = false;
        }
    }

    processedSvixIds.add(svixId!);
    fallbackCounts[lifecycleStatus] = (fallbackCounts[lifecycleStatus] || 0) + 1;

    return NextResponse.json({
        received: true,
        duplicate: false,
        persisted: persistedToSupabase,
        svix_id: svixId,
        event_type: eventType,
        lifecycle_status: lifecycleStatus,
    });
}
