// Clay.com Integration Service for Flowmeet
// Handles Outbound Webhook triggers to Clay tables and Inbound Waterfall Data Ingestion

export interface ClayEnrichmentPayload {
    email: string;
    domain: string;
    company: string;
    role?: string;
    icpScore?: number;
    source?: string;
    metadata?: Record<string, any>;
}

export interface ClayEnrichmentResult {
    success: boolean;
    dispatchedToClay: boolean;
    provider: string;
    message?: string;
    enrichedData?: {
        companyName?: string;
        employees?: number | string;
        estimatedRevenue?: string;
        industry?: string;
        linkedinUrl?: string;
        fundingStage?: string;
        totalFundingRaised?: string;
        headquarters?: string;
        technologies?: string[];
    };
}

/**
 * Dispatch lead data to a Clay Table Webhook for Waterfall Enrichment
 * (Works with Clay's Webhook Source or REST API)
 */
export async function triggerClayEnrichment(
    payload: ClayEnrichmentPayload,
    webhookUrlOverride?: string | null
): Promise<ClayEnrichmentResult> {
    const targetWebhook = webhookUrlOverride || process.env.CLAY_WEBHOOK_URL;

    if (!targetWebhook) {
        // Graceful telemetry: Clay is ready to receive once webhook URL is set in Dashboard or env
        return {
            success: true,
            dispatchedToClay: false,
            provider: "Clay Waterfall Engine",
            message: "Clay webhook URL not configured. Lead processed with Firecrawl & edge firmographics."
        };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(targetWebhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Flowmeet-Clay-Connector/2.0"
            },
            body: JSON.stringify({
                event: "lead.inbound_qualified",
                timestamp: new Date().toISOString(),
                lead: {
                    email: payload.email,
                    domain: payload.domain,
                    company: payload.company,
                    role: payload.role,
                    icp_score: payload.icpScore,
                    source: payload.source || "flowmeet_instant_booker"
                },
                metadata: payload.metadata || {}
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return {
                success: false,
                dispatchedToClay: false,
                provider: "Clay Waterfall Engine",
                message: `Clay webhook returned status HTTP ${response.status}`
            };
        }

        return {
            success: true,
            dispatchedToClay: true,
            provider: "Clay Waterfall Engine",
            message: `Lead successfully dispatched to Clay table for multi-source waterfall enrichment.`
        };
    } catch (error: any) {
        return {
            success: false,
            dispatchedToClay: false,
            provider: "Clay Waterfall Engine",
            message: `Clay dispatch timeout or network failure: ${error.message}`
        };
    }
}
