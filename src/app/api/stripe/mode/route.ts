import { NextResponse } from "next/server";
import { getStripeMode } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Public: which Stripe world the site is charging against.
 *
 * Safe to expose — it says "test" or "live", never a key. The support page
 * uses it to warn a visitor BEFORE they type a card number that no money will
 * be taken, which is the whole point of allowing a runtime switch at all.
 */
export async function GET() {
  const mode = await getStripeMode();
  return NextResponse.json(
    { mode },
    /* Short cache: flipping the switch should reach visitors quickly, but a
       burst of traffic shouldn't be a burst of database reads. */
    { headers: { "Cache-Control": "public, max-age=15" } }
  );
}
