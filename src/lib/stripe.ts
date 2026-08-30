import "server-only";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Stripe client, created per mode on first use.
 *
 * `server-only` makes the build fail loudly if this file is ever imported from
 * a client component — that is the guard that keeps the secret key out of the
 * browser bundle. Never give any of these names a `NEXT_PUBLIC_` prefix:
 * anything with that prefix is inlined into client JS.
 *
 * Why lazy, and not a module-level `new Stripe(...)`:
 *
 * Next evaluates every route module while collecting page data at build time.
 * A `throw` at module scope therefore fired during `next build`, not at request
 * time — so a missing payment secret failed the whole deployment, including the
 * pages that have nothing to do with payments. Deferring the check to the first
 * call keeps the site deployable without Stripe configured, and still fails
 * loudly the moment someone actually tries to pay.
 */

export type StripeMode = "test" | "live";

/* Cached per mode: flipping the switch must not hand back a client still
   holding the other world's key. */
const clients = new Map<StripeMode, Stripe>();

/* The mode is read from the database on nearly every checkout, so it is cached
   briefly. Short enough that flipping the switch takes effect within seconds,
   long enough that a burst of donations isn't a burst of queries. */
let modeCache: { value: StripeMode; at: number } | null = null;
const MODE_TTL_MS = 15_000;

/**
 * Which Stripe world we are charging against.
 *
 * Defaults to "test" whenever the setting is missing or unreadable. A failure
 * to read config must never silently escalate into taking real money.
 */
export async function getStripeMode(): Promise<StripeMode> {
  if (modeCache && Date.now() - modeCache.at < MODE_TTL_MS) {
    return modeCache.value;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let value: StripeMode = "test";

  if (url && anon) {
    try {
      const { data } = await createClient(url, anon)
        .from("site_settings")
        .select("value")
        .eq("key", "stripe_mode")
        .maybeSingle();
      if (data?.value === "live") value = "live";
    } catch (err) {
      console.warn("[stripe] could not read stripe_mode, staying in test:", err);
    }
  }

  modeCache = { value, at: Date.now() };
  return value;
}

/** Clears the cached mode — call after the dashboard writes a new value. */
export function clearStripeModeCache() {
  modeCache = null;
}

function keyFor(mode: StripeMode): string {
  /* Per-mode names, falling back to the single legacy name so an existing
     deployment keeps working without being reconfigured. */
  const specific =
    mode === "live"
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST;
  const key = specific || process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      `No Stripe secret key for ${mode} mode. Set STRIPE_SECRET_KEY_${mode.toUpperCase()} — see .env.example.`
    );
  }

  /* THE IMPORTANT GUARD.
     A live site left in test mode is the dangerous failure: Stripe accepts the
     card, the page says thank you, a row is written — and no money moves, with
     no error anywhere. Nobody notices until someone opens Stripe.
     So if the configured key disagrees with the requested mode, refuse to
     charge at all. A visible 500 beats a donation that silently never happened. */
  const expected = mode === "live" ? "sk_live_" : "sk_test_";
  if (!key.startsWith(expected)) {
    throw new Error(
      `Stripe mode is "${mode}" but the configured key is not a ${expected}… key. ` +
        `Refusing to charge rather than risk taking a payment in the wrong mode.`
    );
  }

  return key;
}

export async function getStripe(): Promise<Stripe> {
  const mode = await getStripeMode();
  const cached = clients.get(mode);
  if (cached) return cached;

  const client = new Stripe(keyFor(mode), {
    /* Pin the version so a Stripe-side upgrade can't change behaviour under us.
       Must match the version the installed SDK types expect. */
    apiVersion: "2026-08-26.dahlia",
    appInfo: { name: "Don't Skip Humanity", url: "https://dontskiphumanity.com" },
  });
  clients.set(mode, client);
  return client;
}

/** The webhook signing secret for the current mode — they differ per world. */
export function webhookSecretFor(mode: StripeMode): string | undefined {
  const specific =
    mode === "live"
      ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
      : process.env.STRIPE_WEBHOOK_SECRET_TEST;
  return specific || process.env.STRIPE_WEBHOOK_SECRET;
}

/** Whether payments are configured at all — for showing a disabled state. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY_TEST ||
      process.env.STRIPE_SECRET_KEY_LIVE
  );
}
