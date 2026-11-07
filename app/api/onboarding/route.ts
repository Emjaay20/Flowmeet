import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { createClient as createSessionClient } from "@/app/lib/supabase/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const reqUserId = body.user_id;
        const reqEmail = body.email;

        // 1. Try session client first
        const sessionClient = await createSessionClient();
        const { data: { user: sessionUser } } = await sessionClient.auth.getUser();

        let user_id = sessionUser?.id;
        let email = sessionUser?.email;

        // 2. If session cookie isn't present yet (e.g. freshly called right after client-side signUp)
        if ((!user_id || !email) && reqUserId && reqEmail) {
            const { data: adminData, error: adminErr } = await supabase.auth.admin.getUserById(reqUserId);
            if (!adminErr && adminData?.user && adminData.user.email?.toLowerCase() === reqEmail.toLowerCase()) {
                user_id = adminData.user.id;
                email = adminData.user.email;
            }
        }

        if (!user_id || !email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user already has a workspace
        const { data: membership, error: membershipError } = await supabase
            .from("workspace_users")
            .select("workspace_id")
            .eq("user_id", user_id)
            .limit(1);

        if (membershipError) throw membershipError;
        if (membership?.length) {
            return NextResponse.json({ success: true, workspace_id: membership[0].workspace_id });
        }

        if (!user_id || !email) {
            return NextResponse.json(
                { error: "Missing user info" },
                { status: 400 }
            );
        }

        // Create workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .insert({
                name: email.split("@")[0] + "'s Workspace",
                owner_email: email,
            })
            .select()
            .single();

        if (workspaceError) throw workspaceError;

        // Attach user as admin
        const { error: userError } = await supabase
            .from("workspace_users")
            .insert({
                workspace_id: workspace.id,
                user_id,
                role: "admin",
            });

        if (userError) throw userError;

        // Generate API key
        const apiKey = "cp_live_" + crypto.randomBytes(24).toString("hex");

        const { error: apiError } = await supabase
            .from("api_keys")
            .insert({
                workspace_id: workspace.id,
                key: apiKey,
            });

        if (apiError) throw apiError;

        return NextResponse.json({
            success: true,
            workspace_id: workspace.id,
            api_key: apiKey,
        });
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { error: "Onboarding failed" },
            { status: 500 }
        );
    }
}
