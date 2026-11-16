import { authenticateWorkspace } from "./workspace-auth";
export async function calendarWorkspace(req: Request) {
    const auth = await authenticateWorkspace(req);
    if (!auth) return { error: "Unauthorized", status: 401 } as const;
    const eventTypeId = Number(process.env.CALCOM_EVENT_TYPE_ID);
    if (auth.workspaceId !== process.env.FLOWMEET_PILOT_WORKSPACE_ID || !Number.isInteger(eventTypeId) || eventTypeId <= 0)
        return { error: "Direct calendar booking is configured only for the pilot workspace; use your workspace booking link", status: 409 } as const;
    return { ...auth, eventTypeId };
}
export function calendarHeaders(version: string) {
    return { "Content-Type": "application/json", "cal-api-version": version,
        ...(process.env.CALCOM_API_KEY ? { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` } : {}) };
}
