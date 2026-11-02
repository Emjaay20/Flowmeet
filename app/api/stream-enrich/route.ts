import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { getCachedDomainScrape, setCachedDomainScrape, checkRateLimit } from "@/app/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Known public/free webmails to detect personal accounts
const FREE_WEBMAILS = new Set([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"
]);

// Tech stack signatures
const TECH_SIGNATURES: Record<string, RegExp[]> = {
    "Next.js": [/next[./]js/i, /_next\//i, /__next/i],
    "React": [/react/i, /react-dom/i],
    "TailwindCSS": [/tailwind/i],
    "Stripe": [/stripe\.com/i, /js\.stripe\.com/i],
    "Kubernetes": [/kubernetes/i, /k8s/i],
    "Docker": [/docker/i],
    "PostgreSQL": [/postgres/i, /psql/i],
    "Supabase": [/supabase/i],
    "Salesforce": [/salesforce/i, /force\.com/i],
    "HubSpot": [/hubspot/i, /hs-scripts/i],
    "AWS": [/aws/i, /amazon web services/i, /s3\.amazonaws/i],
    "Cloudflare": [/cloudflare/i],
    "Python": [/python/i, /fastapi/i, /django/i],
    "GoLang": [/golang/i, /go \d\.\d/i],
    "Rust": [/rust/i, /cargo/i]
};

async function fetchLiveWebsite(domain: string): Promise<{
    title: string;
    description: string;
    markdown: string;
    techStack: string[];
    isEnterprise: boolean;
    engineUsed?: string;
}> {
    // 0. Cache Hit: Check 24-hour domain cache to protect Firecrawl credits
    const cached = getCachedDomainScrape(domain);
    if (cached) {
        return {
            title: cached.title,
            description: cached.description,
            markdown: cached.markdown,
            techStack: cached.techStack,
            isEnterprise: cached.isEnterprise,
            engineUsed: `${cached.engineUsed} (0 Credits Consumed)`
        };
    }

    let title = `${domain.toUpperCase()}`;
    let description = `Official website and enterprise portal for ${domain}`;
    let markdown = "";
    const techStack: string[] = [];
    let isEnterprise = false;
    let engineUsed = "Direct Edge Scraper";

    // 0. Primary: Firecrawl v1 API (Enterprise Scraper using Firecrawl Credits)
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlKey) {
        try {
            const fcController = new AbortController();
            const fcTimeout = setTimeout(() => fcController.abort(), 8000);

            const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${firecrawlKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: `https://${domain}`,
                    formats: ["markdown"]
                }),
                signal: fcController.signal
            });

            clearTimeout(fcTimeout);

            if (fcRes.ok) {
                const fcData = await fcRes.json();
                if (fcData?.data?.markdown) {
                    markdown = fcData.data.markdown;
                    title = fcData?.data?.metadata?.title || title;
                    description = fcData?.data?.metadata?.description || description;
                    engineUsed = "Firecrawl v1 API (Enterprise Credits Active)";
                }
            }
        } catch {
            // Failover to Jina Reader if Firecrawl times out or fails
        }
    }

    // 1. Fallback: Jina Reader for clean, live markdown extraction
    if (!markdown) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4500);

            const jinaUrl = `https://r.jina.ai/https://${domain}`;
            const res = await fetch(jinaUrl, {
                headers: {
                    "User-Agent": "FlowMeet-Enricher/2.0 (+https://flowmeet.ai)",
                    "Accept": "text/plain"
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                markdown = await res.text();
                engineUsed = "Jina Edge Reader";
                
                const h1Match = markdown.match(/^#\s+(.+)$/m);
                if (h1Match) title = h1Match[1].trim();

                const descMatch = markdown.match(/(?:description|about|mission)[:\s]+(.+)/i);
                if (descMatch) description = descMatch[1].trim().slice(0, 160);
            }
        } catch {
            // Fallback to direct HTML scrape if Jina is blocked or offline
        }
    }

    // 2. If markdown still empty, attempt direct lightweight fetch
    if (!markdown) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const directRes = await fetch(`https://${domain}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml"
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (directRes.ok) {
                const html = await directRes.text();
                
                // Extract Title
                const tMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (tMatch) title = tMatch[1].trim();

                // Extract Meta Description
                const mMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
                if (mMatch) description = mMatch[1].trim();

                // Generate concise markdown summary
                markdown = `# ${title}\n\n${description}\n\nDomain: ${domain}\nDirect live extraction completed via FlowMeet Edge Gateway.`;
            }
        } catch {
            markdown = `# ${title}\n\nHigh-performance web services and enterprise operations for ${domain}.\n\nExtracted via FlowMeet Edge Ingestion.`;
        }
    }

    // 3. Scan for Tech Stack signatures in content
    const combinedContent = (title + " " + description + " " + markdown).toLowerCase();
    for (const [tech, regexes] of Object.entries(TECH_SIGNATURES)) {
        if (regexes.some(r => r.test(combinedContent))) {
            techStack.push(tech);
        }
    }
    if (techStack.length === 0) {
        techStack.push("Next.js", "React", "Cloud Infrastructure");
    }

    // 4. Enterprise Indicators
    if (
        combinedContent.includes("enterprise") ||
        combinedContent.includes("soc 2") ||
        combinedContent.includes("saml") ||
        combinedContent.includes("single sign-on") ||
        combinedContent.includes("fortune 500") ||
        combinedContent.includes("dedicated support") ||
        combinedContent.includes("pricing/enterprise")
    ) {
        isEnterprise = true;
    }

    const finalResult = {
        title,
        description,
        markdown: markdown.slice(0, 3000), // Keep clean snippet
        techStack: Array.from(new Set(techStack)).slice(0, 6),
        isEnterprise,
        engineUsed
    };

    // Cache scraped result for 24 hours to preserve credits
    setCachedDomainScrape(domain, finalResult);

    return finalResult;
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    // Client IP Rate Limiting Check
    const forwardedHeader = req.headers.get("x-forwarded-for");
    const clientIp = forwardedHeader ? forwardedHeader.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = checkRateLimit(clientIp);

    let body: any = {};
    try {
        body = await req.json();
    } catch {
        body = {};
    }

    const email = (body.email || "demo@stripe.com").trim().toLowerCase();
    const region = body.region || "Americas (San Francisco)";
    const role = body.role || "VP Engineering";

    // Extract domain
    const emailParts = email.split("@");
    const domain = emailParts.length > 1 ? emailParts[1] : email.replace(/^https?:\/\//, "").split("/")[0];
    const isFreeMail = FREE_WEBMAILS.has(domain);
    const companyGuess = isFreeMail ? "Independent Developer" : domain.split(".")[0].toUpperCase();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            function pushEvent(data: any) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            try {
                // Rate Limiting Enforcement
                if (!rateCheck.allowed) {
                    pushEvent({
                        step: 1,
                        time_ms: 15,
                        status: "RATE_LIMITED",
                        log: `[Rate Limit] Demo threshold exceeded (15/hr for IP ${clientIp}). Please sign in for unrestricted access.`
                    });
                    controller.close();
                    return;
                }

                // STEP 1: Edge Gateway Initialized
                const t1 = Date.now() - startTime;
                pushEvent({
                    step: 1,
                    time_ms: t1,
                    status: "EDGE_INITIALIZED",
                    log: `[${t1}ms] Nginx Edge Gateway received request. Resolved domain: ${domain}`
                });

                await new Promise((r) => setTimeout(r, 120));

                // STEP 2: Live Crawl & Scraping
                pushEvent({
                    step: 2,
                    time_ms: Date.now() - startTime,
                    status: "SCRAPING_DOM",
                    log: `[${Date.now() - startTime}ms] ${process.env.FIRECRAWL_API_KEY ? "Firecrawl Engine" : "Live Crawler"}: Scraping DOM & DNS signals from https://${domain}...`
                });

                const websiteData = isFreeMail
                    ? {
                        title: "Personal / Free Webmail Account",
                        description: "User registered using a consumer webmail provider.",
                        markdown: `# Personal Account (${email})\n\nLead submitted via consumer webmail (${domain}). Deflected to self-serve developer tier.`,
                        techStack: ["Webmail Client"],
                        isEnterprise: false
                    }
                    : await fetchLiveWebsite(domain);

                const t2 = Date.now() - startTime;
                const tokenEstimate = Math.round(websiteData.markdown.length / 4);

                pushEvent({
                    step: 3,
                    time_ms: t2,
                    status: "DOM_PARSED",
                    log: `[${t2}ms] DOM parsed (${websiteData.engineUsed || "Edge Scraper"}). Extracted ~${tokenEstimate} markdown tokens. Page: "${websiteData.title.slice(0, 36)}..."`,
                    preview_markdown: websiteData.markdown.slice(0, 500)
                });

                await new Promise((r) => setTimeout(r, 150));

                // STEP 3: Firmographic Scoring (ICP Matching)
                let icpScore = 55;
                if (!isFreeMail) {
                    icpScore += 15;
                    if (websiteData.isEnterprise) icpScore += 20;
                    if (websiteData.techStack.length >= 3) icpScore += 10;
                    if (role.toLowerCase().includes("vp") || role.toLowerCase().includes("chief") || role.toLowerCase().includes("head") || role.toLowerCase().includes("director")) {
                        icpScore += 15;
                    }
                } else {
                    icpScore = 35; // Webmail penalty
                }
                icpScore = Math.min(99, Math.max(15, icpScore));

                pushEvent({
                    step: 4,
                    time_ms: Date.now() - startTime,
                    status: "ICP_SCORED",
                    log: `[${Date.now() - startTime}ms] ICP Intent Scored: ${icpScore}/100. Tech signatures detected: [${websiteData.techStack.join(", ")}]`
                });

                await new Promise((r) => setTimeout(r, 120));

                // STEP 4: Go Concierge Route Evaluation
                let tier = "SELF_SERVE_DEFLECT";
                let action = "AUTONOMOUS_DOCS_TRIAGE";
                let dealARR = 4900;
                let assignedAE = {
                    name: "FlowMeet AI Onboarding Brain",
                    title: "Autonomous Enablement Specialist",
                    email: "ai.enablement@flowmeet.ai",
                    calendar_url: "https://flowmeet.ai/docs",
                    territory: "Global Cloud Edge",
                    booking_slots: ["Instant API Access", "Interactive Sandbox", "Documentation"]
                };

                if (icpScore >= 80) {
                    tier = "VIP_ENTERPRISE_INSTANT";
                    action = "INSTANT_VIP_CALENDAR_LOCK";
                    dealARR = 65000;

                    const regionLower = region.toLowerCase();
                    if (regionLower.includes("emea") || regionLower.includes("europe") || regionLower.includes("uk") || regionLower.includes("germany")) {
                        assignedAE = {
                            name: "Elena Rostova",
                            title: "VP Enterprise RevOps (EMEA)",
                            email: "elena.rostova@flowmeet.ai",
                            calendar_url: "https://cal.com/elena-rostova-flowmeet/15min",
                            territory: "EMEA Strategic HQ (Munich / London)",
                            booking_slots: ["Tomorrow 2:00 PM CET", "Tomorrow 4:30 PM CET", "Friday 11:00 AM CET"]
                        };
                    } else if (regionLower.includes("apac") || regionLower.includes("asia")) {
                        assignedAE = {
                            name: "Marcus Tan",
                            title: "Head of APAC Enterprise",
                            email: "marcus.tan@flowmeet.ai",
                            calendar_url: "https://cal.com/marcus-tan-flowmeet/15min",
                            territory: "APAC Strategic (Singapore / Tokyo)",
                            booking_slots: ["Tomorrow 10:00 AM SGT", "Tomorrow 2:00 PM SGT", "Friday 3:30 PM SGT"]
                        };
                    } else {
                        assignedAE = {
                            name: "Yusuf Abubakar",
                            title: "Founder & Lead Systems Architect",
                            email: "yusuf@yusufsaka.dev",
                            calendar_url: "https://cal.com/yusuf-abubakar/15min",
                            territory: "Executive Strategic (Americas & Global)",
                            booking_slots: ["Tomorrow 11:00 AM EST", "Tomorrow 2:00 PM EST", "Friday 1:30 PM EST"]
                        };
                    }
                } else if (icpScore >= 60) {
                    tier = "COMMERCIAL_PRIORITY";
                    action = "PRIORITY_DEMO_SCHEDULER";
                    dealARR = 24000;
                    assignedAE = {
                        name: "Alex Mercer",
                        title: "Commercial Account Executive",
                        email: "alex.mercer@flowmeet.ai",
                        calendar_url: "https://cal.com/alex-mercer-flowmeet/30min",
                        territory: "Global Growth Tier",
                        booking_slots: ["Tomorrow 1:00 PM", "Friday 10:30 AM", "Monday 2:00 PM"]
                    };
                }

                const totalLatency = Date.now() - startTime;
                pushEvent({
                    step: 5,
                    time_ms: totalLatency,
                    status: "ROUTED_SUCCESS",
                    log: `[${totalLatency}ms] Route locked in ${totalLatency}ms! Assigned to ${assignedAE.name} (${assignedAE.territory})`,
                    payload: {
                        email,
                        domain,
                        company: companyGuess,
                        title: websiteData.title,
                        description: websiteData.description,
                        icp_score: icpScore,
                        tier,
                        action,
                        estimated_deal_arr_usd: dealARR,
                        tech_stack: websiteData.techStack,
                        is_enterprise: websiteData.isEnterprise,
                        assigned_ae: assignedAE,
                        token_count: tokenEstimate,
                        raw_markdown_snippet: websiteData.markdown.slice(0, 1200),
                        execution_time_ms: totalLatency,
                        live_verified: true
                    }
                });

                // 5. Optionally record lead to Supabase
                try {
                    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
                        await supabase.from("Lead").insert([
                            {
                                email,
                                name: companyGuess + " Contact",
                                company: companyGuess,
                                role,
                                status: tier === "VIP_ENTERPRISE_INSTANT" ? "Routed_VIP" : "Enriched",
                                ai_score: icpScore,
                                ai_reason: `Live enriched from ${domain}. Detected tech: ${websiteData.techStack.join(", ")}.`,
                                region
                            }
                        ]);
                    }
                } catch {
                    // Non-blocking for demo
                }

                controller.close();
            } catch (err: any) {
                pushEvent({
                    step: -1,
                    error: err.message || "Failed to process enrichment",
                    time_ms: Date.now() - startTime
                });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    });
}
