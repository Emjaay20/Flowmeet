import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use Admin Client for backend operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, company, role, region, message } = body

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        // 1. Resolve Workspace
        // Goal: Find the workspace belonging to the ADMIN_EMAIL so they see the lead in their dashboard.
        let workspace_id = null;

        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                // Find user by email
                // Note: listUsers() is not ideal for large userbases but fine for this scale.
                // Better would be if Supabase exposed getUserByEmail in admin API directly.
                // We'll try to just query workspace_users if we can't easy-match, but matching user is best.
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
        } catch (e) {
            console.error("Error resolving admin workspace:", e);
        }

        // Fallback: If no specific admin workspace found, use the first available workspace
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

        // 2. AI Scoring
        const { scoreLeadAI } = await import("@/app/lib/ai/leadscorer");
        // Pass the actual role and region for better AI scoring
        const { score, reason } = scoreLeadAI({ role: role || "Inbound Contact", company, region: region || "Unknown" });

        // 3. Save to Database
        const { data, error } = await supabase
            .from('Lead')
            .insert([{
                name,
                email,
                company,
                role: role || 'Inbound Contact',
                status: 'New',
                ai_score: score,
                ai_reason: reason,
                workspace_id: workspace_id,
                region: region || null,
            }])
            .select()
            .single()

        if (error) {
            console.error("Supabase Insert Error:", error)
            return NextResponse.json({ error: "Failed to save lead" }, { status: 500 })
        }

        // 4. Send Email Notification
        try {
            const { sendEmail } = await import("@/app/lib/email");
            const adminEmail = process.env.ADMIN_EMAIL || "admin@flowmeet.com";

            await sendEmail({
                to: adminEmail,
                subject: `New Contact Enquiry: ${name}`,
                html: `<p>New lead from contact form:</p>
                        <ul>
                            <li>Name: ${name}</li>
                            <li>Email: ${email}</li>
                            <li>Company: ${company}</li>
                            <li>Role: ${role || 'N/A'}</li>
                            <li>Region: ${region || 'N/A'}</li>
                            <li>Message: ${message}</li>
                            <li>AI Score: ${score}/100</li>
                        </ul>`
            });
        } catch (emailError) {
            console.log("Email sending failed (non-critical):", emailError);
        }

        return NextResponse.json({
            success: true,
            message: "Enquiry received successfully",
            lead: data
        })

    } catch (err: any) {
        console.error("Contact Route Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
