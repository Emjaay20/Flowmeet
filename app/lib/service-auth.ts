/** Server-only credentials; never include them in browser responses. */
export function serviceHeaders(): Record<string, string> {
    const token = process.env.FLOWMEET_SERVICE_TOKEN;
    if (!token || token.length < 32) throw new Error("Internal service authentication is not configured");
    return { Authorization: `Bearer ${token}` };
}
