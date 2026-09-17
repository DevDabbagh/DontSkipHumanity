import { NextResponse } from "next/server";
import { getStripeMode, hasStripeKey, webhookSecretFor } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Public: which Stripe world the site is charging against.
 *
 * Safe to expose — it says "test" or "live", never a key. The support page
 * uses it to warn a visitor BEFORE they type a card number that no money will
 * be taken, which is the whole point of allowing a runtime switch at all.
 *
 * `keys` says whether a key EXISTS for each mode, and `webhooks` the same for
 * the signing secrets — booleans only. The dashboard's Settings → Integrations
 * reads them: the keys live on this deployment, not the dashboard's, so this
 * is the only honest way for it to say "Stripe is connected". A boolean
 * reveals nothing an attacker can use; the keys themselves never leave here.
 */
export async function GET() {
  const mode = await getStripeMode();
  return NextResponse.json(
    {
      mode,
      keys: { test: hasStripeKey("test"), live: hasStripeKey("live") },
      webhooks: { test: Boolean(webhookSecretFor("test")), live: Boolean(webhookSecretFor("live")) },
    },
    /* Short cache: flipping the switch should reach visitors quickly, but a
       burst of traffic shouldn't be a burst of database reads. */
    { headers: { "Cache-Control": "public, max-age=15" } }
  );
}
