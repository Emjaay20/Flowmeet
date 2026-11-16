import { NextResponse } from "next/server";
import { calendarWorkspace, calendarHeaders } from "@/app/lib/calendar";

export async function POST(req: Request) {
    const auth = await calendarWorkspace(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body = await req.json().catch(() => null);
    if (!body || !/^[a-f0-9-]{36}$/.test(body.lead_id || "") || typeof body.start !== "string" || !Number.isFinite(Date.parse(body.start)) || Date.parse(body.start) <= Date.now())
        return NextResponse.json({ error: "A saved lead and a future ISO start time are required" }, { status: 400 });
    const { db, workspaceId, eventTypeId } = auth;
    const { data: lead, error } = await db.from("Lead").select("id,email,name,qualified").eq("id", body.lead_id).eq("workspace_id", workspaceId).maybeSingle();
    if (error) return NextResponse.json({ error: "Could not load lead" }, { status: 503 });
    if (!lead?.qualified) return NextResponse.json({ error: "Qualified lead not found in this workspace" }, { status: 404 });
    const eventId = `calendar-request:${lead.id}`;
    const { error: reserved } = await db.from("integration_events").insert({ id: eventId, workspace_id: workspaceId, type: "meeting.request", status: "completed", payload: { lead_id: lead.id, start: body.start }, results: { calendar: { status: "requesting" } } });
    if (reserved?.code === "23505") {
        const { data, error: readError } = await db.from("integration_events").select("payload,results").eq("id", eventId).eq("workspace_id", workspaceId).single();
        if (readError) return NextResponse.json({ error: "Could not verify prior booking" }, { status: 503 });
        if (data.payload.start !== body.start) return NextResponse.json({ error: "This lead already has a booking request. Reconcile or reschedule it before choosing another time." }, { status: 409 });
        return NextResponse.json({ success: data.results.calendar.status === "accepted", duplicate: true, calendar: data.results.calendar });
    }
    if (reserved) return NextResponse.json({ error: "Could not reserve request; no booking attempted" }, { status: 503 });
    let calendar: { status: string; uid?: string; start?: string; end?: string; provider?: string } = { status: "unconfirmed" };
    try {
        const response = await fetch("https://api.cal.com/v2/bookings", { method: "POST", headers: calendarHeaders("2026-02-25"), signal: AbortSignal.timeout(25000), body: JSON.stringify({
            eventTypeId, start: body.start, attendee: { name: lead.name || "FlowMeet lead", email: lead.email, timeZone: "Africa/Lagos", language: "en" },
            metadata: { source: "flowmeet", lead_id: lead.id, workspace_id: workspaceId }, leadEnrichmentOptOut: true,
        }) });
        const result = await response.json();
        if (response.ok && result.data?.uid && typeof result.data.start === "string" && typeof result.data.end === "string") {
            calendar = { provider: "cal.com", status: result.data.status, uid: result.data.uid, start: result.data.start, end: result.data.end };
        } else if (!response.ok) { calendar = { status: "rejected" }; }
    } catch { /* An ambiguous network result must not cause a duplicate invitation. */ }
    const { error: saved } = await db.from("integration_events").update({ results: { calendar }, updated_at: new Date().toISOString() }).eq("id", eventId).eq("workspace_id", workspaceId);
    if (saved) return NextResponse.json({ error: "Provider request made; reconciliation required before retrying" }, { status: 503 });
    if (calendar.status === "accepted") {
        const { error: eventError } = await db.from("integration_events").upsert({ id: `calcom-confirmed:${calendar.uid}`, workspace_id: workspaceId, type: "meeting.booked", status: "completed", results: {}, payload: { lead_id: lead.id, email: lead.email, bookingUid: calendar.uid, startDateTime: calendar.start, endDateTime: calendar.end, source: "calcom_api_response" } });
        const { error: updateError } = await db.from("Lead").update({ status: "Meeting booked" }).eq("id", lead.id).eq("workspace_id", workspaceId);
        if (eventError || updateError) return NextResponse.json({ error: "Meeting accepted by provider; database reconciliation required. Do not create another booking.", calendar }, { status: 503 });
    }
    return NextResponse.json({ success: calendar.status === "accepted", calendar, message: calendar.status === "accepted" ? "Calendar provider confirmed this meeting" : "Calendar request is not confirmed; review provider state before retrying" }, { status: calendar.status === "accepted" ? 201 : 202 });
}
