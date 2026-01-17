import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { scoreLeadAI } from '@/app/lib/ai/leadscorer'
import { sendEmail } from "@/app/lib/email";
import { tenantLeadEmail } from "@/app/lib/emails/tenantLeadNotification";
import { leadBookingEmail } from "@/app/lib/emails/leadBookingEmail";


export async function POST(req: Request) {
    const supabase = await createClient()
    const body = await req.json()

    const { name, email, company, role, region } = body
    const { score, reason } = scoreLeadAI({ role, company, region })

    // ---- LEAD QUALIFICATION LOGIC ----
    const isQualifiedRole = role?.toLowerCase().match(/manager|head|director|founder/)
    const hasCompany = company?.length > 1
    const qualified = (score >= 0.6) || (!!(isQualifiedRole && hasCompany))

    // ---- MEETING LINK (STATIC FOR NOW) ----
    const bookingUrl = qualified
        ? 'https://calendly.com/yourname/demo-call'
        : null

    // ---- EMAIL NOTIFICATIONS ----
    if (qualified && bookingUrl) {
        try {
            // 1. Email admin/tenant
            // TODO: Replace with dynamic workspace owner email if available
            const adminEmail = process.env.ADMIN_EMAIL || "admin@flowmeet.com";

            await sendEmail({
                to: adminEmail,
                subject: "New Qualified Lead",
                html: tenantLeadEmail({
                    name,
                    email,
                    company,
                    score,
                }),
            });

            // 2. Email lead
            await sendEmail({
                to: email,
                subject: "Book a meeting",
                html: leadBookingEmail({
                    name,
                    bookingUrl,
                }),
            });
        } catch (emailError) {
            console.error("Failed to send emails:", emailError);
            // Continue execution to save lead to DB even if email fails
        }
    }

    // ---- SAVE TO DATABASE ----
    const { data, error } = await supabase
        .from('Lead')
        .insert([
            {
                name,
                email,
                company,
                role,
                region,
                qualified,
                booking_url: bookingUrl,
                ai_score: score,
                ai_reason: reason,
            },
        ])
        .select()
        .single()

    if (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ---- RESPONSE BACK TO FRONTEND ----
    return NextResponse.json({
        success: true,
        qualified,
        bookingUrl,
    })
}
