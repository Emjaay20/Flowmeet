import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";

// Inbound webhook from Clay.com Table Automations
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            company,
            employees,
            revenue,
            linkedin_url,
            technologies,
            funding_stage,
            hq_location,
            secret
        } = body;

        // Security check if secret configured
        const expectedSecret = process.env.CLAY_WEBHOOK_SECRET;
        if (expectedSecret && secret !== expectedSecret) {
            return NextResponse.json({ error: "Unauthorized Clay webhook signature" }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: "Email is required for Clay lead enrichment" }, { status: 400 });
        }

        console.log(`[Clay Webhook] Inbound enrichment received for ${email}:`, {
            company,
            employees,
            revenue,
            funding_stage
        });

        // 1. Update Supabase Lead record with Clay enriched signals
        try {
            if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
                await supabase
                    .from("Lead")
                    .update({
                        company: company || undefined,
                        metadata: {
                            clay_enriched: true,
                            employees,
                            revenue,
                            linkedin_url,
                            technologies,
                            funding_stage,
                            hq_location,
                            enriched_at: new Date().toISOString()
                        }
                    })
                    .eq("email", email.toLowerCase());
            }
        } catch (dbErr: any) {
            console.warn("[Clay Webhook] Database sync notice:", dbErr.message);
        }

        return NextResponse.json({
            success: true,
            provider: "Clay Waterfall Engine",
            message: `Lead ${email} successfully enriched with Clay firmographics`,
            enriched: {
                email,
                company,
                employees,
                revenue,
                funding_stage,
                linkedin_url
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
