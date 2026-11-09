import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only populated AFTER confirmed database persistence
const processedSvixIds = new Set<string>();

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

function extractWorkspaceTag(data: any): string | null {
    const tags = data?.tags;
    if (!tags) return null;
    if (Array.isArray(tags)) {
        const match = tags.find((t: any) => t?.name === "workspace_id" && typeof t?.value === "string");
        if (match && UUID_REGEX.test(match.value)) {
            return match.value;
        }
    } else if (typeof tags === "object" && typeof tags.workspace_id === "string") {
        if (UUID_REGEX.test(tags.workspace_id)) {
            return tags.workspace_id;
        }
    }
    return null;
}

async function resolveOriginatingWorkspace(
    db: SupabaseClient,
    emailId: string,
    data: any
): Promise<{ workspaceId: string | null; dbError: boolean }> {
    // 1. Check explicit workspace_id tag attached to the outbound Resend message
    const taggedWorkspace = extractWorkspaceTag(data);
    if (taggedWorkspace) {
        return { workspaceId: taggedWorkspace, dbError: false };
    }

    // 2. Look up deterministic outbound message-to-workspace binding in integration_events
    const { data: bindingRow, error: bindingErr } = await db
        .from("integration_events")
        .select("workspace_id")
        .eq("id", `resend-msg:${emailId}`)
        .maybeSingle();

    if (bindingErr) {
        return { workspaceId: null, dbError: true };
    }
    if (bindingRow?.workspace_id && UUID_REGEX.test(bindingRow.workspace_id)) {
        return { workspaceId: bindingRow.workspace_id, dbError: false };
    }

    // 3. Check if any prior verified webhook event for this email_id already resolved the workspace
    const { data: priorEvent, error: priorErr } = await db
        .from("integration_events")
        .select("workspace_id")
        .eq("payload->>email_id", emailId)
        .limit(1)
        .maybeSingle();

    if (priorErr) {
        return { workspaceId: null, dbError: true };
    }
    if (priorEvent?.workspace_id && UUID_REGEX.test(priorEvent.workspace_id)) {
        return { workspaceId: priorEvent.workspace_id, dbError: false };
    }

    // 4. Configured pilot/founder workspace UUID (never queries arbitrary rows from workspace_users)
    const configuredWorkspace =
        process.env.FOUNDER_WORKSPACE_ID || process.env.FLOWMEET_PILOT_WORKSPACE_ID || null;
    if (configuredWorkspace && UUID_REGEX.test(configuredWorkspace)) {
        return { workspaceId: configuredWorkspace, dbError: false };
    }

    return { workspaceId: null, dbError: false };
}

export async function GET(req: NextRequest) {
    const counts: Record<string, number> = {
        SENT_TO_MTA: 0,
        DELIVERED_TO_MAILBOX: 0,
        DELIVERY_DELAYED: 0,
        BOUNCED: 0,
        COMPLAINED_SPAM: 0,
        RECIPIENT_OPENED: 0,
        RECIPIENT_CLICKED: 0,
    };

    const requestedWorkspace = req.nextUrl.searchParams.get("workspace_id");
    const defaultWorkspace =
        process.env.FOUNDER_WORKSPACE_ID || process.env.FLOWMEET_PILOT_WORKSPACE_ID || null;
    const scopedWorkspaceId =
        requestedWorkspace && UUID_REGEX.test(requestedWorkspace)
            ? requestedWorkspace
            : defaultWorkspace && UUID_REGEX.test(defaultWorkspace)
            ? defaultWorkspace
            : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !scopedWorkspaceId) {
        return NextResponse.json(
            {
                error: "Database credentials or valid workspace scope not configured",
            },
            { status: 503 }
        );
    }

    const db = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await db
        .from("integration_events")
        .select("type")
        .eq("workspace_id", scopedWorkspaceId)
        .in("type", Object.keys(EVENT_STATUS_MAP));

    if (error) {
        return NextResponse.json(
            {
                error: "Failed to query scoped delivery metrics",
            },
            { status: 503 }
        );
    }

    if (Array.isArray(data)) {
        for (const row of data) {
            const status = EVENT_STATUS_MAP[row.type];
            if (status) {
                counts[status] = (counts[status] || 0) + 1;
            }
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
            workspace_scope: "DETERMINISTIC_TENANT_SCOPED",
            security: {
                signature_verification: "SVIX_HMAC_SHA256_REQUIRED",
                replay_window_seconds: 300,
                deduplication: "SVIX_ID_IDEMPOTENT_SUPABASE",
                failure_handling: "RETRYABLE_503_ON_DB_ERROR",
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            {
                received: false,
                retryable: true,
                error: "Webhook signing secret or database configuration missing",
            },
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

    // Fast-path idempotency check (only contains svixIds already durably committed to Supabase)
    if (processedSvixIds.has(svixId!)) {
        return NextResponse.json({
            received: true,
            duplicate: true,
            persisted: true,
            svix_id: svixId,
            lifecycle_status: lifecycleStatus,
        });
    }

    const db = createClient(supabaseUrl, supabaseServiceKey);

    // Deterministically resolve originating workspace ownership
    const { workspaceId, dbError } = await resolveOriginatingWorkspace(db, emailId, body.data);
    if (dbError) {
        return NextResponse.json(
            {
                received: false,
                retryable: true,
                error: "Transient database error while resolving workspace ownership",
            },
            { status: 503 }
        );
    }

    if (!workspaceId) {
        return NextResponse.json(
            {
                received: false,
                error: "Unable to deterministically resolve originating workspace for email_id",
            },
            { status: 422 }
        );
    }

    // Persist to Supabase before marking event processed; return 503 on failure so Resend retries
    const { error: insertError } = await db.from("integration_events").insert({
        id: svixId!,
        workspace_id: workspaceId,
        type: eventType,
        status: "completed",
        payload: {
            svix_id: svixId,
            email_id: emailId,
            workspace_id: workspaceId,
            event_type: eventType,
            lifecycle_status: lifecycleStatus,
            created_at: body?.created_at || new Date().toISOString(),
        },
    });

    if (insertError) {
        if (insertError.code === "23505") {
            processedSvixIds.add(svixId!);
            return NextResponse.json({
                received: true,
                duplicate: true,
                persisted: true,
                svix_id: svixId,
                lifecycle_status: lifecycleStatus,
            });
        }

        // Do NOT add to processedSvixIds; return 503 so Resend's webhook scheduler retries
        return NextResponse.json(
            {
                received: false,
                retryable: true,
                error: "Failed to persist webhook event to database; scheduled for retry",
            },
            { status: 503 }
        );
    }

    processedSvixIds.add(svixId!);

    return NextResponse.json({
        received: true,
        duplicate: false,
        persisted: true,
        svix_id: svixId,
        event_type: eventType,
        lifecycle_status: lifecycleStatus,
    });
}
