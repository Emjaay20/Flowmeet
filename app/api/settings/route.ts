import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // 1. Authenticate User
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Parse Body
        const { bookingUrl } = await req.json()

        // 3. Get User's Workspace
        const { data: workspaceUser, error: wsError } = await supabase
            .from("workspace_users")
            .select("workspace_id")
            .eq("user_id", session.user.id)
            .single()

        if (wsError || !workspaceUser) {
            return NextResponse.json({ error: "No workspace found" }, { status: 404 })
        }

        // 4. Update Workspace Settings
        const { error: updateError } = await supabase
            .from("workspaces")
            .update({ booking_url: bookingUrl })
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
