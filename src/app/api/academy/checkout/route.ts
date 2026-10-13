import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/reader";
import { getStripe } from "@/lib/stripe";
import { resolveSiteUrl } from "@/lib/site-url";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Buy a course.
 *
 * Only a signed-in learner can buy — the enrolment has to belong to someone.
 * The price, currency and title are read from the database here; the browser
 * sends only which course. Tagged `kind: "course"` so the webhook records an
 * enrolment, not a donation.
 */
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let programId = "";
  try {
    const body = await req.json();
    programId = typeof body?.programId === "string" ? body.programId : "";
  } catch {
    /* handled below */
  }
  if (!/^[0-9a-f-]{36}$/i.test(programId)) return NextResponse.json({ error: "Unknown course." }, { status: 400 });
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Checkout is not available yet." }, { status: 503 });

  const db = getSupabaseAdmin();
  const { data: program } = await db
    .from("academy_programs")
    .select("id, slug, title, is_free, price, currency, status")
    .eq("id", programId)
    .maybeSingle();
  if (!program || program.status !== "published") return NextResponse.json({ error: "Unknown course." }, { status: 404 });
  if (program.is_free) return NextResponse.json({ error: "This course is free." }, { status: 400 });

  const cents = Math.round(Number(program.price) * 100);
  if (!(cents >= 100)) return NextResponse.json({ error: "This course has no price yet." }, { status: 400 });

  const { data: existing } = await db
    .from("academy_enrollments")
    .select("access_type, status")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .maybeSingle();
  if (existing?.status === "active" && existing.access_type === "paid") {
    return NextResponse.json({ error: "You already own this course." }, { status: 409 });
  }

  const title =
    typeof program.title === "string"
      ? program.title
      : (program.title?.pt || program.title?.en || Object.values(program.title ?? {})[0] || "DSH course");

  const site = resolveSiteUrl(req);
  try {
    const session = await (await getStripe()).checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: String(program.currency || "EUR").toLowerCase(),
            unit_amount: cents,
            product_data: { name: `${title} — DSH Academy` },
          },
        },
      ],
      client_reference_id: userId,
      metadata: { kind: "course", program_id: program.id, user_id: userId, program_slug: program.slug, source: "web" },
      success_url: `${site}/course/${program.slug}/learn?purchase={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/course/${program.slug}?purchase=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[academy/checkout]", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
