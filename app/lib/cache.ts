// Flowmeet Credit Protection & Rate Limiting Engine
// Designed to preserve Firecrawl API credits (11,000 pool) and prevent public abuse

interface CachedScrape {
    title: string;
    description: string;
    markdown: string;
    techStack: string[];
    isEnterprise: boolean;
    engineUsed: string;
    cachedAt: number;
}

interface RateLimitRecord {
    count: number;
    firstRequestAt: number;
}

// In-memory domain cache (24-hour TTL)
const domainScrapeCache = new Map<string, CachedScrape>();

// In-memory IP rate limiter (Hourly window)
const ipRateLimitMap = new Map<string, RateLimitRecord>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 15; // Max 15 scrapes per IP per hour for public demo

// Pre-warm high-frequency showcase domains so they NEVER consume Firecrawl credits
domainScrapeCache.set("stripe.com", {
    title: "Stripe | Financial Infrastructure for the Internet",
    description: "Stripe powers online and in-person payments, billing, invoicing, and treasury for businesses of all sizes worldwide.",
    markdown: "# Stripe\n\nStripe powers online and in-person payments, billing, invoicing, and treasury for businesses of all sizes worldwide. Enterprise grade infrastructure trusted by millions of companies.",
    techStack: ["Next.js", "React", "Ruby", "Kubernetes", "AWS", "Stripe Connect"],
    isEnterprise: true,
    engineUsed: "Flowmeet Prewarmed Cache",
    cachedAt: Date.now()
});

domainScrapeCache.set("linear.app", {
    title: "Linear | The issue tracking tool you'll actually enjoy using",
    description: "Linear is a purpose-built tool for planning and building products. Streamline software projects, sprints, tasks, and bug tracking.",
    markdown: "# Linear\n\nLinear helps streamline software projects, sprints, tasks, and bug tracking. Designed for high-performance software teams.",
    techStack: ["React", "GraphQL", "TypeScript", "Node.js", "Tailwind CSS"],
    isEnterprise: true,
    engineUsed: "Flowmeet Prewarmed Cache",
    cachedAt: Date.now()
});

domainScrapeCache.set("automattic.com", {
    title: "Automattic Inc. | We are the people behind WordPress.com, WooCommerce, and Jetpack",
    description: "Automattic is a distributed company behind WordPress.com, WooCommerce, Jetpack, Tumblr, and more.",
    markdown: "# Automattic\n\nAutomattic is a fully distributed company with over 2,000 employees globally. Powers over 43% of the web through open source and managed software.",
    techStack: ["WordPress", "PHP", "React", "MySQL", "OpenSource"],
    isEnterprise: true,
    engineUsed: "Flowmeet Prewarmed Cache",
    cachedAt: Date.now()
});

domainScrapeCache.set("cal.com", {
    title: "Cal.com | Open Scheduling Infrastructure",
    description: "Cal.com is the open source scheduling platform for everyone. Connect your calendar, set availability, and let people book slots.",
    markdown: "# Cal.com\n\nCal.com is the open source scheduling infrastructure. Powers calendar booking, round-robin lead distribution, and automated reminders.",
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
    isEnterprise: true,
    engineUsed: "Flowmeet Prewarmed Cache",
    cachedAt: Date.now()
});

domainScrapeCache.set("yusufsaka.dev", {
    title: "Yusuf Saka | Distributed Systems & AI Infrastructure Engineer",
    description: "Personal engineering portfolio of Yusuf Abubakar (Saka). Full-stack distributed systems, autonomous agents, and cloud architecture.",
    markdown: "# Yusuf Saka\n\nFounder & Lead Systems Architect. Specializing in high-throughput B2B SaaS, autonomous agent orchestration, and edge infrastructure.",
    techStack: ["Next.js", "React", "Go", "Docker", "Nginx", "Supabase", "TypeScript"],
    isEnterprise: true,
    engineUsed: "Flowmeet Prewarmed Cache",
    cachedAt: Date.now()
});

/**
 * Retrieve cached scrape result if valid and within TTL
 */
export function getCachedDomainScrape(domain: string): CachedScrape | null {
    const key = domain.trim().toLowerCase();
    const entry = domainScrapeCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
        domainScrapeCache.delete(key);
        return null;
    }

    return entry;
}

/**
 * Save scrape result to memory cache
 */
export function setCachedDomainScrape(domain: string, data: Omit<CachedScrape, "cachedAt">): void {
    const key = domain.trim().toLowerCase();
    domainScrapeCache.set(key, {
        ...data,
        cachedAt: Date.now()
    });
}

/**
 * IP-based Rate Limiter for Public Unauthenticated Demo
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds: number }
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const record = ipRateLimitMap.get(ip);

    if (!record) {
        ipRateLimitMap.set(ip, { count: 1, firstRequestAt: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
    }

    // Check if current window has expired
    if (now - record.firstRequestAt > RATE_LIMIT_WINDOW_MS) {
        ipRateLimitMap.set(ip, { count: 1, firstRequestAt: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
    }

    // Check quota within current window
    if (record.count >= MAX_REQUESTS_PER_HOUR) {
        const resetTime = record.firstRequestAt + RATE_LIMIT_WINDOW_MS;
        const retryAfterSeconds = Math.ceil((resetTime - now) / 1000);
        return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    record.count += 1;
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - record.count };
}
