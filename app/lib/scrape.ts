// Fetching a company's homepage and turning it into signals.
//
// Order: the built-in Rust crawler first. Firecrawl is only called when the
// crawler fails or returns almost no text, so credits are spent only where the
// free path could not read the page. Nothing here invents data: when every
// path fails the caller gets an error.

export interface ScrapeResult {
    source: "flowmeet-crawler" | "firecrawl";
    title: string;
    description: string;
    markdown: string;
    techStack: string[];
    indicators: string[];
    sizeTier: string;
    intentScore: number;
    elapsedMs: number;
}

export interface ScrapeOutcome {
    result: ScrapeResult | null;
    /** Human-readable notes about each attempt, in order. */
    attempts: string[];
}

const THIN_PAGE_CHARS = 400;

const crawlerUrl = () => process.env.RUST_CRAWLER_URL || "http://127.0.0.1:8081";

/** Domains the public demo is allowed to crawl. */
export function allowedDemoDomains(): string[] {
    return (process.env.FLOWMEET_DEMO_DOMAINS || "stripe.com,github.com,yusufsaka.dev")
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean);
}

export function isAllowedDemoDomain(domain: string): boolean {
    return allowedDemoDomains().includes(domain.toLowerCase());
}

async function postJson(url: string, body: unknown, timeoutMs: number, headers: Record<string, string> = {}) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
}

async function viaCrawler(domain: string): Promise<ScrapeResult> {
    const started = Date.now();
    const res = await postJson(`${crawlerUrl()}/scrape`, { url: domain }, 12000);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.details || data.error || `crawler returned HTTP ${res.status}`);
    const s = data.firmographic_signals || {};
    return {
        source: "flowmeet-crawler",
        title: data.page_title || "",
        description: data.meta_description || "",
        markdown: data.llm_markdown || "",
        techStack: s.detected_tech_stack || [],
        indicators: s.enterprise_indicators || [],
        sizeTier: s.estimated_size_tier || "Unknown",
        intentScore: s.intent_score ?? 0,
        elapsedMs: Date.now() - started,
    };
}

async function viaFirecrawl(domain: string): Promise<ScrapeResult> {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error("no Firecrawl key configured");
    const started = Date.now();
    const res = await postJson(
        "https://api.firecrawl.dev/v1/scrape",
        { url: `https://${domain}`, formats: ["markdown"] },
        15000,
        { Authorization: `Bearer ${key}` },
    );
    if (!res.ok) throw new Error(`Firecrawl returned HTTP ${res.status}`);
    const data = await res.json();
    const markdown: string = data?.data?.markdown || "";
    if (!markdown) throw new Error("Firecrawl returned no content");

    // Run the same keyword detector the crawler uses so both paths agree.
    const analysis = await postJson(`${crawlerUrl()}/analyze`, { url: domain, markdown }, 5000)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    const s = analysis?.firmographic_signals || {};

    return {
        source: "firecrawl",
        title: data?.data?.metadata?.title || "",
        description: data?.data?.metadata?.description || "",
        markdown: markdown.slice(0, 16000),
        techStack: s.detected_tech_stack || [],
        indicators: s.enterprise_indicators || [],
        sizeTier: s.estimated_size_tier || "Unknown",
        intentScore: s.intent_score ?? 0,
        elapsedMs: Date.now() - started,
    };
}

export async function scrapeDomain(domain: string): Promise<ScrapeOutcome> {
    const attempts: string[] = [];
    let crawled: ScrapeResult | null = null;

    try {
        crawled = await viaCrawler(domain);
        attempts.push(`crawler read ${crawled.markdown.length.toLocaleString()} characters in ${crawled.elapsedMs} ms`);
        if (crawled.markdown.length >= THIN_PAGE_CHARS) return { result: crawled, attempts };
        attempts.push("page returned very little text (it may render with JavaScript)");
    } catch (e) {
        attempts.push(`crawler failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }

    if (process.env.FIRECRAWL_API_KEY) {
        try {
            const fc = await viaFirecrawl(domain);
            attempts.push(`Firecrawl read ${fc.markdown.length.toLocaleString()} characters in ${fc.elapsedMs} ms`);
            return { result: fc, attempts };
        } catch (e) {
            attempts.push(`Firecrawl failed: ${e instanceof Error ? e.message : "unknown error"}`);
        }
    }

    // A thin crawler result is still real data, so return it rather than nothing.
    return { result: crawled, attempts };
}
