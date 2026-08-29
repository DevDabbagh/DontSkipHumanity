import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * The donor's choice on the thank-you dialog: leave their name and email so
 * the gift is kept against them, or stay anonymous.
 *
 * Guarded on three counts, because the only thing the caller presents is a
 * checkout session id:
 *   · the id must correspond to a real, PAID session (checked with Stripe)
 *   · the row must not already be claimed — first answer wins, so a leaked
 *     link can't be used to overwrite a donor's details afterwards
 *   · nothing here grants access to anything; it only labels one row
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Body = {
  sessionId?: string;
  name?: string;
  email?: string;
  anonymous?: boolean;
};

export async function POST(req: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Donations storage is not configured." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
  }

  const anonymous = body.anonymous === true;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";

  if (!anonymous && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email, or continue anonymously." },
      { status: 400 }
    );
  }

  /* The session must really exist and really be paid. */
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "That payment is not complete." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Unknown payment." }, { status: 404 });
  }

  const db = getSupabaseAdmin();

  const { data: existing, error: readErr } = await db
    .from("donations")
    .select("id, donor_confirmed")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (readErr) {
    console.error("[donations/claim] read failed", readErr);
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Donation not found yet." }, { status: 404 });
  }

  /* First answer wins — keyed on whether the donor has ANSWERED, not on
     whether we happen to hold an email. Stripe always gives us one at
     checkout, so guarding on `donor_email` would reject every answer,
     including "stay anonymous". */
  if (existing.donor_confirmed === true) {
    return NextResponse.json({ ok: true, alreadyRecorded: true });
  }

  const { error: updErr } = await db
    .from("donations")
    .update(
      anonymous
        ? {
            /* Clear the address Stripe collected. Anonymity that leaves the
               email sitting in our table isn't anonymity. */
            is_anonymous: true,
            donor_name: null,
            donor_email: null,
            donor_confirmed: true,
            updated_at: new Date().toISOString(),
          }
        : {
            is_anonymous: false,
            donor_email: email,
            donor_name: name || null,
            donor_confirmed: true,
            updated_at: new Date().toISOString(),
          }
    )
    .eq("stripe_session_id", sessionId);

  if (updErr) {
    console.error("[donations/claim] update failed", updErr);
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
