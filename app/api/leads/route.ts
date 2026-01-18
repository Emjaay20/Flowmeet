import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreLeadAI } from '@/app/lib/ai/leadscorer'
import { sendEmail } from "@/app/lib/email";
import { tenantLeadEmail } from "@/app/lib/emails/tenantLeadNotification";
import { leadBookingEmail } from "@/app/lib/emails/leadBookingEmail";

// Use Admin Client for backend operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function getWorkspaceFromApiKey(apiKey: string) {
    const { data, error } = await supabase
        .from("api_keys")
        .select("workspace_id")
        .eq("key", apiKey)
        .single();

    if (error || !data) return null;
    return data.workspace_id;
}

async function getWorkspaceId(userId: string) {
    if (!userId) return null;

    const { data, error } = await supabase
        .from("workspace_users")
        .select("workspace_id")
        .eq("user_id", userId)
        .single();

    if (error) {
        console.warn("Could not find workspace for user:", userId, error.message);
        return null;
    }
    return data.workspace_id;
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, company, role, region, userId } = body

        // 1. Authentication & Workspace Resolution
        let workspace_id = null;

        // Check for API Key Header
        const apiKey = req.headers.get("x-api-key");

        if (apiKey) {
            workspace_id = await getWorkspaceFromApiKey(apiKey);
            if (!workspace_id) {
                return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
            }
        } else if (userId) {
            // Fallback: Use userId (Demo Mode)
            workspace_id = await getWorkspaceId(userId);
        }

        // 2. AI Scoring
        const { score, reason } = scoreLeadAI({ role, company, region })

        // 3. Qualification Logic
        const isQualifiedRole = role?.toLowerCase().match(/manager|head|director|founder/)
        const hasCompany = company?.length > 1
        const qualified = (score >= 0.6) || (!!(isQualifiedRole && hasCompany))

        // 4. Meeting Link
        const bookingUrl = qualified
            ? 'https://calendly.com/yourname/demo-call' // TODO: Make dynamic per workspace
            : null

        // 5. Send Emails (if qualified)
        if (qualified && bookingUrl) {
            try {
                // TODO: Fetch workspace owner email instead of env fallback
                const adminEmail = process.env.ADMIN_EMAIL || "admin@flowmeet.com";

                // Email Admin
                await sendEmail({
                    to: adminEmail,
                    subject: "New Qualified Lead",
                    html: tenantLeadEmail({ name, email, company, score }),
                });

                // Email Lead
                await sendEmail({
                    to: email,
                    subject: "Book a meeting",
                    html: leadBookingEmail({ name, bookingUrl }),
                });
            } catch (emailError) {
                console.error("Failed to send emails:", emailError);
            }
        }

        // 6. Save to Database
        const { data, error } = await supabase
            .from('Lead')
            .insert([{
                name,
                email,
                company,
                role,
                region,
                qualified,
                booking_url: bookingUrl,
                ai_score: score,
                ai_reason: reason,
                workspace_id: workspace_id, // Link to workspace if found
                status: qualified ? 'Qualified' : 'Unqualified'
            }])
            .select()
            .single()

        if (error) {
            console.error(error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            qualified,
            bookingUrl,
            lead: data
        })

    } catch (err: any) {
        console.error("Route Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
