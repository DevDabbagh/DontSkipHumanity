import "server-only";
import type Stripe from "stripe";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

/**
 * Turns a paid course checkout into a paid enrolment.
 *
 * Called from the webhook (fires even if the buyer closes the tab) and from
 * the on-return verify (so the course opens the moment they land back).
 * `unique(user_id, program_id)` makes running both safe.
 *
 * Every fact comes from the Stripe session: the buyer and the course are the
 * metadata our own checkout route wrote, from a verified token and a database
 * read — never anything the browser sent.
 */
export function isCourseSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.kind === "course";
}

export async function recordCoursePurchase(
  session: Stripe.Checkout.Session
): Promise<{ ok: true; programId: string; skipped?: string } | { ok: false; error: string }> {
  const md = session.metadata ?? {};
  const programId = md.program_id ?? "";
  const userId = md.user_id ?? "";
  if (!programId || !userId) return { ok: false, error: "Session is missing its course or buyer." };

  if (!isSupabaseAdminConfigured()) {
    console.warn("[academy] SUPABASE_SERVICE_ROLE_KEY missing — purchase not recorded:", session.id);
    return { ok: true, programId, skipped: "not_configured" };
  }
  if (session.payment_status !== "paid") return { ok: true, programId, skipped: "not_paid" };

  const db = getSupabaseAdmin();
  const { error } = await db.from("academy_enrollments").upsert(
    {
      user_id: userId,
      program_id: programId,
      access_type: "paid",
      status: "active",
      source: "stripe",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      amount_cents: session.amount_total ?? null,
      currency: session.currency ?? null,
    },
    { onConflict: "user_id,program_id" }
  );
  if (error) {
    console.error("[academy] recording purchase failed", session.id, error.message);
    return { ok: false, error: "Could not record the purchase." };
  }
  return { ok: true, programId };
}
