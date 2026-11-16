import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authenticateWorkspace } from "@/app/lib/workspace-auth";
import { scoreLeadAI } from "@/app/lib/ai/leadscorer";
import { fingerprint, httpsBookingUrl, stableLeadId } from "@/app/lib/lead-capture";
import { deliverBookingEmail } from "@/app/lib/lead-delivery";

export async function POST(req: Request) {
    try {
        const auth = await authenticateWorkspace(req);
        if (!auth) return NextResponse.json({ error: "A workspace administrator session or server API key is required" }, { status: 401 });
        const body = await req.json().catch(() => null);
        if (!body || typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
            return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
        const input = {
            name: typeof body.name === "string" ? body.name.trim().slice(0, 120) : "",
            email: body.email.trim().toLowerCase(), company: typeof body.company === "string" ? body.company.trim().slice(0, 120) : "",
            role: typeof body.role === "string" ? body.role.trim().slice(0, 120) : "",
            region: typeof body.region === "string" ? body.region.trim().slice(0, 60) : "",
            send_booking_email: body.send_booking_email === true,
        };
        const suppliedKey = req.headers.get("idempotency-key");
        if ((input.send_booking_email && !suppliedKey) || (suppliedKey && !/^[a-zA-Z0-9_-]{8,128}$/.test(suppliedKey)))
            return NextResponse.json({ error: "Use an Idempotency-Key of 8–128 letters, digits, hyphens or underscores; required when requesting delivery" }, { status: 400 });
        if (new URL(req.url).searchParams.get("via") === "n8n") {
            if (auth.workspaceId !== process.env.FLOWMEET_CAPTURE_WORKSPACE_ID || !process.env.FLOWMEET_N8N_CAPTURE_TOKEN)
                return NextResponse.json({ error: "n8n customer capture is not configured for this workspace" }, { status: 409 });
            const origin = process.env.N8N_INTERNAL_WEBHOOK_URL?.replace(/\/webhook\/.*$/, "");
            if (!origin) return NextResponse.json({ error: "n8n is not configured" }, { status: 503 });
            const response = await fetch(`${origin}/webhook/flowmeet-customer-capture`, {
                method: "POST", headers: { "Content-Type": "application/json", "x-flowmeet-capture-token": process.env.FLOWMEET_N8N_CAPTURE_TOKEN, ...(suppliedKey ? { "Idempotency-Key": suppliedKey } : {}) },
                body: JSON.stringify(input), signal: AbortSignal.timeout(45000),
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) return NextResponse.json({ error: "Customer capture workflow failed; retry with the same Idempotency-Key" }, { status: 502 });
            return NextResponse.json({ ...result, orchestrator: "n8n" }, { status: 200, headers: { "Cache-Control": "no-store" } });
        }
        const key = suppliedKey || randomUUID();
        const { db, workspaceId } = auth;
        const id = stableLeadId(workspaceId, key), digest = fingerprint(input);
        const { data: workspace, error: settingsError } = await db.from("workspaces").select("booking_url").eq("id", workspaceId).single();
        if (settingsError) throw new Error("Could not load workspace settings");
        const { score, reason } = scoreLeadAI(input);
        const qualified = score >= 0.6 || Boolean(input.role.match(/manager|head|director|founder/i) && input.company.length > 1);
        const bookingUrl = qualified ? httpsBookingUrl(workspace.booking_url) : null;
        if (input.send_booking_email && (!bookingUrl || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM))
            return NextResponse.json({ error: "Delivery requires a qualified lead, an HTTPS workspace booking link, and configured email provider" }, { status: 409 });
        const eventId = `lead-request:${id}`;
        const { error: reserved } = await db.from("integration_events").insert({ id: eventId, workspace_id: workspaceId, type: "lead.capture.request", status: "completed", payload: { fingerprint: digest, lead_id: id }, results: {} });
        if (reserved?.code === "23505") {
            const { data, error } = await db.from("integration_events").select("payload").eq("id", eventId).eq("workspace_id", workspaceId).single();
            if (error) throw new Error("Could not verify request identity");
            if (data.payload.fingerprint !== digest) return NextResponse.json({ error: "This Idempotency-Key was already used for a different request" }, { status: 409 });
        } else if (reserved) throw new Error("Could not reserve lead request");
        const { error: saveError } = await db.from("Lead").insert({ id, ...Object.fromEntries(Object.entries(input).filter(([k]) => k !== "send_booking_email")), workspace_id: workspaceId, qualified, booking_url: bookingUrl, ai_score: score, ai_reason: reason, status: qualified ? "Qualified" : "Unqualified" });
        if (saveError && saveError.code !== "23505") throw new Error("Lead could not be saved; no email sent");
        const { data: lead, error: readError } = await db.from("Lead").select("*").eq("id", id).eq("workspace_id", workspaceId).single();
        if (readError) throw new Error("Could not verify saved lead");
        const delivery = input.send_booking_email ? await deliverBookingEmail(db, workspaceId, lead) : { status: "not_requested", email_id: null };
        return NextResponse.json({ success: true, qualified: lead.qualified, bookingUrl: lead.booking_url, lead, delivery, duplicate: saveError?.code === "23505" }, { status: saveError ? 200 : 201, headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ error: "Capture could not complete. Retry using the same Idempotency-Key; do not create a new key for a delivery already in progress." }, { status: 503 });
    }
}
