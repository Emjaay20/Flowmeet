import {NextResponse} from "next/server";
export async function POST() {
 return NextResponse.json({success:false, error:"Direct demo sync is disabled. CRM activities must originate from verified booking events."},{status:409});
}
