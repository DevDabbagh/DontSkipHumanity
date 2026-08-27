import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client, created on first use.
 *
 * `server-only` makes the build fail loudly if this file is ever imported from
 * a client component — that is the guard that keeps the secret key out of the
 * browser bundle. Never rename `STRIPE_SECRET_KEY` to `NEXT_PUBLIC_*`: anything
 * with that prefix is inlined into client JS and would leak the key.
 *
 * Why lazy, and not a module-level `new Stripe(...)`:
 *
 * Next evaluates every route module while collecting page data at build time.
 * A `throw` at module scope therefore fired during `next build`, not at request
 * time — so a missing payment secret failed the whole deployment, including the
 * pages that have nothing to do with payments. Deferring the check to the first
 * call keeps the site deployable without Stripe configured, and still fails
 * loudly, with the same message, the moment someone actually tries to pay.
 */

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example."
    );
  }

  client = new Stripe(key, {
    /* Pin the version so a Stripe-side upgrade can't change behaviour under us.
       Must match the version the installed SDK types expect. */
    apiVersion: "2026-08-26.dahlia",
    appInfo: { name: "Don't Skip Humanity", url: "https://dontskiphumanity.com" },
  });
  return client;
}

/** True when the configured key is a test key. Used to badge the sandbox UI. */
export function isTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_");
}

/** Whether payments are configured at all — for showing a disabled state. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
