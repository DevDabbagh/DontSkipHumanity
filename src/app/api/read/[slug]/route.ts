import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/reader";
import { hasActiveSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The body of a subscription article.
 *
 * WHY A ROUTE AND NOT JUST THE PAGE
 *
 * The paywall in the frame draws a card over the article. Drawing is not
 * withholding: if the page ships the text and covers it with CSS, the text is
 * in the page source and "View source" is the whole paywall. So the page never
 * receives the body of a subscription article at all — it renders everything
 * else and asks here, with the reader's own access token, for the part it is
 * missing.
 *
 * WHAT THIS CHECKS, IN ORDER
 *
 *   1. Is the article real and published?     — 404 if not
 *   2. Is it free?                            — then anyone may read it
 *   3. Who is asking? (verified token)        — 401 if nobody
 *   4. Do they have a live subscription?      — 402 if not
 *
 * Every failure returns the reason and no text. A 402 with the body attached
 * would be the same bug in a different shape.
 *
 * The service-role client is used because `articles` is anon-readable and this
 * route is deliberately stricter than the table's own policy — it must be able
 * to read the row in order to decide *not* to hand it over.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  interface Row {
    access: string;
    body: unknown;
    status: string;
  }

  let article: Row | null = null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("articles")
      .select("access, body, status")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    article = (data as Row | null) ?? null;
  } catch (err) {
    console.error("[read] could not load article", slug, err);
    /* Fail closed: an unreadable row is not an open one. */
    return NextResponse.json({ error: "Could not load this article." }, { status: 500 });
  }

  if (!article || article.status !== "published") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (article.access !== "subscription") {
    /* A free article does not need any of the checks below, and going through
       them would make a public page depend on being signed in. */
    return NextResponse.json({ body: article.body ?? [] });
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { error: "sign_in_required", message: "Sign in to read this article." },
      { status: 401 }
    );
  }

  if (!(await hasActiveSubscription(userId))) {
    return NextResponse.json(
      { error: "subscription_required", message: "This article is for subscribers." },
      { status: 402 }
    );
  }

  return NextResponse.json({ body: article.body ?? [] });
}
