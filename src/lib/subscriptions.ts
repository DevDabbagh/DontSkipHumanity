import "server-only";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase-admin";

/**
 * Recurring support — the `subscriptions` table.
 *
 * WHY THIS EXISTS
 *
 * The table was created in the first migration and nothing had ever written to
 * it. The webhook logged "invoice.paid" to the console and moved on. So a
 * reader could pay for a monthly subscription, Stripe would take the money, and
 * the site would have no record that they were a subscriber — which meant any
 * paywall built on top of it would lock out the very people who had paid.
 *
 * WHY THE SERVICE ROLE
 *
 * `subscriptions` is admin-only by RLS (migration 006) and the subscriber is
 * not the one making this request — Stripe is. The signature has already been
 * verified by the time anything here runs, so the truth is established; the
 * service role is how the row gets written. Nothing here trusts the request
 * body on its own.
 *
 * IDEMPOTENCE
 *
 * Stripe retries. `stripe_subscription_id` is unique, so every write is an
 * upsert on that column — a replayed event updates the row it already wrote
 * instead of creating a second subscription for the same person.
 */

/** Stripe gives seconds; Postgres wants a timestamp. */
function at(seconds: number | null | undefined): string {
  const ms = (seconds ?? Math.floor(Date.now() / 1000)) * 1000;
  return new Date(ms).toISOString();
}

/**
 * A monthly gift completed checkout — record it as an active subscription.
 *
 * Called only for `mode === "subscription"` sessions. One-off donations go
 * through `recordDonation` and never reach here.
 */
export async function recordSubscription(session: Stripe.Checkout.Session): Promise<void> {
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (!stripeSubscriptionId) {
    /* A subscription-mode session with no subscription id is a Stripe-side
       oddity, not something to paper over with a guessed value. */
    console.warn("[subscriptions] subscription-mode session with no subscription id", session.id);
    return;
  }

  /* The user id is carried through checkout metadata. A logged-out visitor can
     still give monthly — the row is written with a null user so the money is
     recorded, but it entitles nobody until it is claimed. Silently attaching it
     to the wrong account would be worse than leaving it unattached. */
  const userId = session.metadata?.user_id || null;

  const amount = (session.amount_total ?? 0) / 100;
  const start = at(session.created);
  /* Renewals move this forward; see `extendSubscription`. A month is the only
     plan the site offers today. */
  const nextBilling = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString();

  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: "monthly",
        amount,
        status: "active",
        start_date: start,
        end_date: nextBilling,
        next_billing: nextBilling,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      },
      { onConflict: "stripe_subscription_id" }
    );

  if (error) {
    /* Loudly: a subscription that fails to record is money taken for access
       that will not be granted. */
    console.error("[subscriptions] could not record", stripeSubscriptionId, error.message);
    throw new Error(`Could not record subscription: ${error.message}`);
  }
}

/** A renewal was paid — push the period forward and make sure it is active. */
export async function extendSubscription(invoice: Stripe.Invoice): Promise<void> {
  const raw = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  const id = typeof raw === "string" ? raw : raw?.id;
  if (!id) return;

  const periodEnd = (invoice as unknown as { period_end?: number }).period_end;
  const end = at(periodEnd);

  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .update({ status: "active", end_date: end, next_billing: end })
    .eq("stripe_subscription_id", id);

  if (error) console.error("[subscriptions] could not extend", id, error.message);
}

/** Cancelled at Stripe — stop entitling the reader. */
export async function cancelSubscription(subscription: Stripe.Subscription): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id);

  if (error) console.error("[subscriptions] could not cancel", subscription.id, error.message);
}

/**
 * Does this user have a subscription that is live right now?
 *
 * Both conditions matter. `status = 'active'` alone would keep entitling
 * someone whose card failed months ago if a cancellation webhook was ever
 * missed; `end_date` alone would entitle someone who cancelled mid-period,
 * which is arguably right but is a policy decision, not an accident. Requiring
 * both means a missed webhook expires the access rather than extending it.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .limit(1);

  if (error) {
    /* Fail closed. An unreadable subscriptions table must not hand out access. */
    console.error("[subscriptions] entitlement check failed", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}
