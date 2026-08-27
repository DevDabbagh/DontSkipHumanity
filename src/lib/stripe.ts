import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client.
 *
 * `server-only` makes the build fail loudly if this file is ever imported from
 * a client component — that is the guard that keeps the secret key out of the
 * browser bundle. Never rename `STRIPE_SECRET_KEY` to `NEXT_PUBLIC_*`: anything
 * with that prefix is inlined into client JS and would leak the key.
 */
const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example."
  );
}

export const stripe = new Stripe(key, {
  /* Pin the version so a Stripe-side upgrade can't change behaviour under us.
     Must match the version the installed SDK types expect. */
  apiVersion: "2026-08-26.dahlia",
  appInfo: { name: "Don't Skip Humanity", url: "https://dontskiphumanity.com" },
});

/** True when the configured key is a test key. Used to badge the sandbox UI. */
export const isTestMode = key.startsWith("sk_test_");
