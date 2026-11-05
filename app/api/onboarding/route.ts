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
        const sessionClient = await createSessionClient();
        const { data: { user } } = await sessionClient.auth.getUser();
        if (!user || !user.email) return NextResponse.json({error:"Unauthorized"}, {status:401});
        const user_id = user.id, email = user.email;
        const {data: membership, error: membershipError} = await supabase.from("workspace_users").select("workspace_id").eq("user_id",user_id).limit(1);
        if (membershipError) throw membershipError;
        if (membership?.length) return NextResponse.json({success:true, workspace_id:membership[0].workspace_id});

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
