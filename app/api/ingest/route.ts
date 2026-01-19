import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreLeadAI } from '@/app/lib/ai/leadscorer'
import { sendEmail } from "@/app/lib/email"
import { tenantLeadEmail } from "@/app/lib/emails/tenantLeadNotification"

// Use Admin Client for backend operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function OPTIONS(req: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-flowmeet-secret',
        },
    })
}

export async function POST(req: Request) {
    try {
        // 1. Authentication Check
        const secret = req.headers.get("x-flowmeet-secret");
        const validSecret = process.env.FLOWMEET_INGEST_SECRET;

        // If no secret is configured in env, block everything for security
        if (!validSecret) {
            console.error("FLOWMEET_INGEST_SECRET is not set in environment variables.");
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        if (secret !== validSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json()
        const { name, email, company, role, region, message, source } = body

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        // 2. Resolve Workspace
        // Priority 1: FOUNDER_WORKSPACE_ID env var
        // Priority 2: Admin Email Lookup
        let workspace_id = process.env.FOUNDER_WORKSPACE_ID;

        if (!workspace_id) {
            // Try to find workspace for ADMIN_EMAIL
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
                if (users && !userError) {
                    const adminUser = users.find(u => u.email === adminEmail);
                    if (adminUser) {
                        const { data: link } = await supabase
                            .from('workspace_users')
                            .select('workspace_id')
                            .eq('user_id', adminUser.id)
                            .limit(1)
                            .single();
                        if (link) {
                            workspace_id = link.workspace_id;
                        }
                    }
                }
            }
        }

        // Fallback: If still no workspace, use the first available one (Safety Net)
        if (!workspace_id) {
            const { data: workspaceData } = await supabase
                .from('workspaces')
                .select('id')
                .limit(1)
                .single();
            if (workspaceData) {
                workspace_id = workspaceData.id;
            }
        }

        // 3. AI Scoring
        const { score, reason } = scoreLeadAI({
            role: role || "Inbound Contact",
            company: company || "Unknown",
            region: region || "Unknown"
        });

        // 4. Save to Database
        const { data, error } = await supabase
            .from('Lead')
            .insert([{
                name,
                email,
                company: company || "N/A",
                role: role || 'Inbound Contact',
                status: 'New',
                ai_score: score,
                ai_reason: reason,
                workspace_id: workspace_id,
                region: region || null,
                // We could add a 'source' column to the DB if it exists, otherwise it's just metadata for now
                // For now, we'll rely on the fact it's in the founder workspace
            }])
            .select()
            .single()

        if (error) {
            console.error("Supabase Insert Error:", error)
            return NextResponse.json({ error: "Failed to save lead" }, { status: 500 })
        }

        // 5. Send Email Notification
        try {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@flowmeet.com";

            // Reusing tenant lead email template for consistency, or we could make a new one
            await sendEmail({
                to: adminEmail!,
                subject: `New Lead from ${source || 'External Source'}: ${name}`,
                html: tenantLeadEmail({ name, email, company: company || 'N/A', score }),
            });

        } catch (emailError) {
            console.log("Email sending failed (non-critical):", emailError);
        }

        return NextResponse.json({
            success: true,
            message: "Lead ingested successfully",
            lead: data
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        })

    } catch (err: any) {
        console.error("Ingest Route Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
