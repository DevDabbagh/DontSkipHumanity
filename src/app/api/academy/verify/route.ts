import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/reader";
import { getStripe } from "@/lib/stripe";
import { isCourseSession, recordCoursePurchase } from "@/lib/course-purchase";

export const runtime = "nodejs";

/**
 * Called when the buyer lands back from Stripe, so the course opens at once
 * without waiting on the webhook (which also records it — both are safe).
 * The session must be a course purchase made by the caller.
 */
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let sessionId = "";
  try {
    const body = await req.json();
    sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  } catch {
    /* handled below */
  }
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return NextResponse.json({ error: "Unknown purchase." }, { status: 400 });

  try {
    const session = await (await getStripe()).checkout.sessions.retrieve(sessionId);
    if (!isCourseSession(session) || session.metadata?.user_id !== userId) {
      return NextResponse.json({ error: "Unknown purchase." }, { status: 404 });
    }
    const res = await recordCoursePurchase(session);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ ok: true, paid: session.payment_status === "paid" });
  } catch (err) {
    console.error("[academy/verify]", err);
    return NextResponse.json({ error: "Could not confirm the purchase." }, { status: 500 });
  }
}
