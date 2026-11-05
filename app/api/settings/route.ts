import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Parse Body
        const { bookingUrl, clayEnabled, clayApiKey } = await req.json()

        // 3. Get User's Workspace
        const { data: workspaceUser, error: wsError } = await supabase
            .from("workspace_users")
            .select("workspace_id, role")
            .eq("user_id", user.id)
            .single()

        if (wsError || !workspaceUser) {
            return NextResponse.json({ error: "No workspace found" }, { status: 404 })
        }

        if (workspaceUser.role !== "admin") return NextResponse.json({error:"Admin permission required"}, {status:403});
        if (bookingUrl) {
            try { if (new URL(bookingUrl).protocol !== "https:") throw new Error(); }
            catch { return NextResponse.json({error:"An HTTPS booking URL is required"}, {status:400}); }
        }
        // 4. Update Workspace Settings
        const { error: updateError } = await supabase
            .from("workspaces")
            .update({
                booking_url: bookingUrl,
                clay_enabled: clayEnabled,
                clay_api_key: clayApiKey
            })
            .eq("id", workspaceUser.workspace_id)

        if (updateError) {
            console.error("Error updating workspace:", updateError)
            return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error("Settings API Error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
