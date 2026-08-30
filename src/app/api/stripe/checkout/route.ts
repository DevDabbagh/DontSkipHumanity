import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { resolveSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout session.
 *
 * Covers the three donation entry points in the design:
 *   · one-time      → mode "payment"
 *   · monthly       → mode "subscription"
 *   · project       → one-time, tagged with the project it came from so the
 *                     money can be attributed (Ahmed's "project card" idea)
 *
 * The amount is validated server-side. Never trust a price sent by the
 * browser — a client can post any number it likes.
 */

/**
 * DSH collects in euro, full stop. Decided here rather than accepted from the
 * browser: the client used to be able to post any three-letter code, so a
 * donation could arrive in a currency nobody chose — Stripe would then convert
 * it into the account's currency and charge a conversion fee, and the
 * dashboard would show "25" of something that isn't €25.
 */
const CURRENCY = "eur";

/**
 * No upper limit: a supporter gives what they choose, and a cap that silently
 * rejects a large gift is worse than any problem it prevents.
 *
 * A floor still exists, because it isn't a policy — it's arithmetic. Stripe
 * rejects charges under its own minimum outright, and card fees would eat a
 * 10-cent donation whole, so anything below €1 costs DSH money to accept.
 *
 * Stripe's own ceiling (999,999.99 in the account currency per charge) still
 * applies above this; it returns a clear error of its own if anyone reaches it.
 */
const MIN_CENTS = 100; // €1 — the point below which fees exceed the gift

type Body = {
  mode?: "one_time" | "monthly";
  /** Major units, e.g. 25 for €25 */
  amount?: number;
  /** Optional attribution — shown on the checkout and kept on the session */
  projectType?: "film" | "studio" | "academy";
  projectSlug?: string;
  projectTitle?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const mode = body.mode === "monthly" ? "monthly" : "one_time";

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const cents = Math.round(amount * 100);
  if (cents < MIN_CENTS) {
    return NextResponse.json(
      { error: `The smallest amount we can accept is €${MIN_CENTS / 100}.` },
      { status: 400 }
    );
  }

  /* Attribution is free text from the client, so it is length-capped and only
     ever used as a label / metadata — never as a lookup key or in a query. */
  const trim = (s: unknown, max: number) =>
    typeof s === "string" ? s.trim().slice(0, max) : undefined;

  const projectTitle = trim(body.projectTitle, 120);
  const projectSlug = trim(body.projectSlug, 120);
  const projectType =
    body.projectType === "film" || body.projectType === "studio" || body.projectType === "academy"
      ? body.projectType
      : undefined;

  /* Explicit env var if set, otherwise the domain this request came in on —
     so moving to DSH's own domain needs no configuration change, and a stale
     value can't silently return donors to the old address. */
  const site = resolveSiteUrl(req);

  const productName = projectTitle
    ? `Support: ${projectTitle}`
    : mode === "monthly"
      ? "Monthly support — Don't Skip Humanity"
      : "One-time support — Don't Skip Humanity";

  try {
    const session = await (await getStripe()).checkout.sessions.create({
      mode: mode === "monthly" ? "subscription" : "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: cents,
            product_data: {
              name: productName,
              ...(projectTitle && {
                description: `Your contribution goes to ${projectTitle}.`,
              }),
            },
            ...(mode === "monthly" && { recurring: { interval: "month" as const } }),
          },
        },
      ],
      /* Kept on the session so the dashboard can report per-project totals. */
      metadata: {
        ...(projectType && { project_type: projectType }),
        ...(projectSlug && { project_slug: projectSlug }),
        ...(projectTitle && { project_title: projectTitle }),
        support_mode: mode,
      },
      success_url: `${site}/support?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/support?status=cancelled`,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    /* Log server-side, return something generic — Stripe errors can carry
       details that shouldn't be echoed to the browser. */
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
