import "server-only";
import type Stripe from "stripe";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

/**
 * Turns a completed Stripe Checkout session into a donation row.
 *
 * Called from two places on purpose:
 *   · the webhook — fires even if the donor closes the tab
 *   · the on-return verify — so it also works locally without `stripe listen`
 *
 * `stripe_session_id` is UNIQUE, so running both is safe: the second one
 * conflicts and updates instead of inserting a duplicate.
 *
 * Every figure here comes from the Stripe session, never from the browser.
 */
export type RecordResult =
  | { ok: true; skipped?: "not_paid" | "not_configured" }
  | { ok: false; error: string };

export async function recordDonation(
  session: Stripe.Checkout.Session
): Promise<RecordResult> {
  if (!isSupabaseAdminConfigured()) {
    /* Payment still succeeded — we just can't file it yet. Loud in logs,
       silent to the donor, who has already been charged. */
    console.warn(
      "[donations] SUPABASE_SERVICE_ROLE_KEY missing — donation not recorded:",
      session.id
    );
    return { ok: true, skipped: "not_configured" };
  }

  if (session.payment_status !== "paid") {
    return { ok: true, skipped: "not_paid" };
  }

  const md = session.metadata ?? {};
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  const name = session.customer_details?.name ?? null;

  /* amount_total is in the currency's minor unit. */
  const amount = (session.amount_total ?? 0) / 100;

  const db = getSupabaseAdmin();

  /* Payment facts — safe to refresh on every call. */
  const payment = {
    stripe_session_id: session.id,
    stripe_payment_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    amount,
    currency: session.currency ?? "eur",
    support_mode: md.support_mode === "monthly" ? "monthly" : "one_time",
    status: "paid",
    is_guest: true,
    project_type: md.project_type ?? null,
    project_slug: md.project_slug ?? null,
    project_title: md.project_title ?? null,
    updated_at: new Date().toISOString(),
  };

  /* Donor identity from Stripe — only ever a DEFAULT, used until the donor
     answers the thank-you dialog. */
  const donorDefaults = {
    donor_email: email,
    donor_name: name,
    is_anonymous: !email,
  };

  const { data: existing, error: readErr } = await db
    .from("donations")
    .select("id, donor_confirmed")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (readErr) {
    console.error("[donations] read failed", readErr);
    return { ok: false, error: readErr.message };
  }

  /* CRITICAL: once the donor has chosen — especially if they chose to be
     anonymous — this function must not touch their identity again. It runs
     on every page load of the success screen and again when the webhook
     lands, so a blind upsert would restore the email Stripe collected and
     quietly undo the anonymity they asked for. */
  const payload = existing?.donor_confirmed
    ? payment
    : { ...payment, ...donorDefaults };

  const { error } = existing
    ? await db.from("donations").update(payload).eq("stripe_session_id", session.id)
    : await db.from("donations").insert(payload);

  if (error) {
    console.error("[donations] write failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
