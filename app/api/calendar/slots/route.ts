import { NextResponse } from "next/server";
import { calendarWorkspace, calendarHeaders } from "@/app/lib/calendar";
export async function GET(req: Request) {
    const auth = await calendarWorkspace(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const params = new URL(req.url).searchParams;
    const start = params.get("start"), end = params.get("end");
    if (!start || !end || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || Date.parse(end) <= Date.parse(start) || Date.parse(end) - Date.parse(start) > 7 * 86400000)
        return NextResponse.json({ error: "Supply start and end dates at most seven days apart" }, { status: 400 });
    try {
        const query = new URLSearchParams({ eventTypeId: String(auth.eventTypeId), start, end, timeZone: "Africa/Lagos" });
        const response = await fetch(`https://api.cal.com/v2/slots?${query}`, { headers: calendarHeaders("2024-09-04"), signal: AbortSignal.timeout(15000), cache: "no-store" });
        if (!response.ok) throw new Error();
        return NextResponse.json({ success: true, provider: "cal.com", timeZone: "Africa/Lagos", data: (await response.json()).data }, { headers: { "Cache-Control": "no-store" } });
    } catch { return NextResponse.json({ error: "Calendar availability could not be verified" }, { status: 502 }); }
}
