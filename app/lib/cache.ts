// In-process cache and rate limiter for the public demo.
//
// Both live in memory in the web process, so they reset on restart and are not
// shared between instances. That is enough to stop a single visitor from
// spending Firecrawl credits, which is all they are for.

import type { ScrapeResult } from "@/app/lib/scrape";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
export const MAX_REQUESTS_PER_HOUR = 15;

const MAX_CACHE_ENTRIES = 500;
const MAX_TRACKED_CLIENTS = 5000;

interface CacheEntry {
    value: ScrapeResult;
    cachedAt: number;
}

const scrapeCache = new Map<string, CacheEntry>();
const clientWindows = new Map<string, { count: number; startedAt: number }>();

export function getCachedDomainScrape(domain: string): ScrapeResult | null {
    const key = domain.trim().toLowerCase();
    const entry = scrapeCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
        scrapeCache.delete(key);
        return null;
    }
    return entry.value;
}

export function setCachedDomainScrape(domain: string, value: ScrapeResult): void {
    if (scrapeCache.size >= MAX_CACHE_ENTRIES) {
        // Maps iterate in insertion order, so the first key is the oldest.
        const oldest = scrapeCache.keys().next().value;
        if (oldest !== undefined) scrapeCache.delete(oldest);
    }
    scrapeCache.set(domain.trim().toLowerCase(), { value, cachedAt: Date.now() });
}

export function checkRateLimit(client: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const current = clientWindows.get(client);

    if (!current || now - current.startedAt > RATE_WINDOW_MS) {
        if (clientWindows.size >= MAX_TRACKED_CLIENTS) {
            const oldest = clientWindows.keys().next().value;
            if (oldest !== undefined) clientWindows.delete(oldest);
        }
        clientWindows.set(client, { count: 1, startedAt: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
    }

    if (current.count >= MAX_REQUESTS_PER_HOUR) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.ceil((current.startedAt + RATE_WINDOW_MS - now) / 1000),
        };
    }

    current.count += 1;
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - current.count };
}

export function clientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
}
