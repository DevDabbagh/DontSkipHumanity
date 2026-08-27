import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Newsletter signup — step one of double opt-in.
 *
 * Goes through the `newsletter_subscribe` SQL function rather than writing to
 * the table: RLS blocks the table entirely for the public, and the function
 * is the only door. It always reports success, so this endpoint can never be
 * used to test whether a given address is on the list.
 *
 * The IP is captured as consent evidence. It is written to the subscriber row
 * and never returned to the browser.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string; consentText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  // First hop of x-forwarded-for is the client; the rest are proxies.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";

  const supabase = createClient(url, key);
  const { error } = await supabase.rpc("newsletter_subscribe", {
    p_email: email,
    p_source: (body.source ?? "").slice(0, 60),
    p_consent_text: (body.consentText ?? "").slice(0, 500),
    p_consent_ip: ip.slice(0, 64),
  });

  if (error) {
    // Log server-side; the browser gets nothing that describes the list.
    console.error("newsletter_subscribe failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
