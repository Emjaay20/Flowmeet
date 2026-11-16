import { createHash } from "node:crypto";

export function stableLeadId(workspace: string, key: string) {
    const bytes = createHash("sha256").update(`flowmeet:lead:${workspace}:${key}`).digest().subarray(0, 16);
    bytes[6] = (bytes[6] & 15) | 80;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = bytes.toString("hex");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function fingerprint(value: unknown) {
    return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]!));
}
export function httpsBookingUrl(raw: unknown): string | null {
    if (typeof raw !== "string" || raw.length > 2048) return null;
    try {
        const url = new URL(raw);
        return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
    } catch { return null; }
}
