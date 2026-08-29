import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordDonation } from "@/lib/donations";
import {
  getFilmBySlug,
  getStudioProjectBySlug,
  getProgramBySlug,
} from "@/lib/api";

/** The thing the donation was attached to, for the card in the dialog. */
async function loadProjectCard(type?: string, slug?: string) {
  if (!type || !slug) return null;
  try {
    if (type === "film") {
      const f = await getFilmBySlug(slug);
      return f && {
        title: f.title,
        image: f.posterUrl || f.thumbnailUrl || null,
        line: f.logline ?? null,
        kind: "Film",
        href: `/film/${f.slug}`,
      };
    }
    if (type === "studio") {
      const p = await getStudioProjectBySlug(slug);
      return p && {
        title: p.title,
        image: p.thumbnailUrl || p.coverUrl || null,
        line: p.oneLineDescription ?? null,
        kind: "Studio",
        href: `/studio/${p.slug}`,
      };
    }
    if (type === "academy") {
      const a = await getProgramBySlug(slug);
      return a && {
        title: a.title,
        image: (a as { thumbnailUrl?: string; coverUrl?: string }).thumbnailUrl
          ?? (a as { coverUrl?: string }).coverUrl
          ?? null,
        line: a.description ?? null,
        kind: "Academy",
        href: `/academy/${a.slug}`,
      };
    }
  } catch {
    /* A missing project must never break the thank-you screen. */
  }
  return null;
}

export const runtime = "nodejs";

/**
 * Called by the success dialog when the donor lands back on /support.
 *
 * Does two things:
 *   1. records the donation (idempotent — the webhook may have got there first)
 *   2. returns only what the dialog needs to display
 *
 * Deliberately NOT a passthrough of the Stripe session: that object carries
 * far more than a thank-you screen should hand back to the browser.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");

  /* Shape-check before spending a Stripe call on it. */
  if (!id || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false }, { status: 200 });
    }

    await recordDonation(session);

    const md = session.metadata ?? {};
    const project = await loadProjectCard(md.project_type, md.project_slug);

    return NextResponse.json({
      paid: true,
      amount: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "eur",
      email: session.customer_details?.email ?? null,
      name: session.customer_details?.name ?? null,
      supportMode: md.support_mode === "monthly" ? "monthly" : "one_time",
      projectTitle: md.project_title ?? null,
      project,
    });
  } catch (err) {
    console.error("[stripe/session]", err);
    return NextResponse.json(
      { error: "Could not load that payment." },
      { status: 500 }
    );
  }
}
