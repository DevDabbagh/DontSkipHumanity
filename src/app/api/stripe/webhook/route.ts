import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordDonation } from "@/lib/donations";

export const runtime = "nodejs";

/**
 * Stripe webhook.
 *
 * The signature check is the whole point: without it anyone who knows the URL
 * could POST a fake "payment succeeded" and mark a donation as paid. The raw
 * body is required — parsing it first would break the signature.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const raw = await req.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      /* Source of truth for recording — fires even if the donor closes the
         tab before being redirected back. Idempotent via stripe_session_id. */
      await recordDonation(session);
      /* TODO: persist to Supabase — amount, currency, and the project_* keys
         from metadata, so the dashboard can report who funded what. */
      console.log("[stripe] checkout completed", {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      });
      break;
    }
    case "invoice.paid":
    case "customer.subscription.deleted":
      /* TODO: recurring support lifecycle. */
      console.log("[stripe]", event.type);
      break;
    default:
      break;
  }

  /* Always 200 once the signature is valid, otherwise Stripe retries. */
  return NextResponse.json({ received: true });
}
