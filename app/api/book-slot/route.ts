import { NextResponse } from "next/server";
// Calendar provider owns availability and confirmation. No synthetic invitations.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    return NextResponse.json({error: "A valid email is required"}, {status: 400});
  const raw = process.env.FLOWMEET_BOOKING_URL;
  if (!raw) return NextResponse.json({success:false, status:"not_configured", error:"Calendar connection is not configured"}, {status:503});
  let url: URL;
  try { url = new URL(raw); if (url.protocol !== "https:") throw new Error(); }
  catch { return NextResponse.json({error:"Calendar configuration is invalid"}, {status:503}); }
  url.searchParams.set("email", body.email);
  return NextResponse.json({success:true, status:"booking_required", bookingUrl:url.toString(), message:"Choose an available time with the calendar provider. No meeting has been confirmed yet."});
}
