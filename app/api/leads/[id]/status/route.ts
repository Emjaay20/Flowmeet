import { NextResponse } from "next/server";
import { authenticateWorkspace } from "@/app/lib/workspace-auth";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authenticateWorkspace(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    const { db, workspaceId } = auth;
    const { data: lead, error } = await db.from("Lead").select("id,status,qualified,booking_url").eq("id", id).eq("workspace_id", workspaceId).maybeSingle();
    if (error) return NextResponse.json({ error: "Status unavailable" }, { status: 503 });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const { data: delivery } = await db.from("integration_events").select("results,payload").eq("id", `lead-delivery:${id}`).eq("workspace_id", workspaceId).maybeSingle();
    const emailId = delivery?.payload?.email_id;
    let events: { type: string; created_at: string }[] = [];
    if (emailId) {
        const { data } = await db.from("integration_events").select("type,created_at").eq("workspace_id", workspaceId).eq("payload->>email_id", emailId).like("type", "email.%").neq("type", "email.dispatched").order("created_at");
        events = data || [];
    }
    return NextResponse.json({ lead, delivery: delivery?.results?.delivery || { status: "not_requested" }, verified_delivery_events: events }, { headers: { "Cache-Control": "no-store" } });
}
