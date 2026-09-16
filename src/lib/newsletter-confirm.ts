import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * The confirmation email — the missing half of double opt-in.
 *
 * WHAT WAS BROKEN
 *
 * Migration 014 generates a `confirm_token` on every signup, and this site
 * has had a working `/newsletter/confirm` page the whole time. Nothing ever
 * read that token or sent it anywhere. So every address that has ever
 * subscribed is sitting at `pending`, has received nothing, and can never
 * become `subscribed` — which also means a newsletter send has no recipients
 * at all. The list looked like it was growing and was in fact empty.
 *
 * WHY IT LIVES HERE AND NOT IN THE DASHBOARD
 *
 * It belongs beside the subscribe route that triggers it. The dashboard is a
 * separate deployment; a server action there is not callable from here, and
 * routing this through an HTTP hop between the two would add a network
 * failure to a path whose whole job is to be reliable.
 *
 * WHY IT CANNOT BE AIMED AT SOMEONE
 *
 * It takes an address, looks for a row that is specifically `pending`, and
 * does nothing if there isn't one. So it cannot mail an arbitrary address,
 * cannot re-mail a confirmed subscriber, and cannot be used to test whether
 * someone is on the list — the caller gets the same silence either way.
 */

function config() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM;
  return { key, from };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendNewsletterConfirmation(
  email: string,
  siteUrl: string,
): Promise<void> {
  const { key, from } = config();

  // Not configured is a deployment state, not a user error. The row exists
  // either way; log it so it is discoverable, and let the signup succeed.
  if (!key || !from) {
    console.warn(
      "[newsletter] RESEND_API_KEY or NEWSLETTER_FROM is unset — no confirmation email sent.",
    );
    return;
  }

  const address = email.trim().toLowerCase();

  const { data, error } = await getSupabaseAdmin()
    .from("newsletter_subscribers")
    .select("confirm_token")
    .ilike("email", address)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !data?.confirm_token) return;

  const url = `${siteUrl.replace(/\/+$/, "")}/newsletter/confirm?token=${data.confirm_token}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#F0F0F0;">

  <div style="font-size:13px;letter-spacing:1.8px;text-transform:uppercase;color:rgba(240,240,240,0.35);margin-bottom:28px;">
    Don&#39;t Skip Humanity
  </div>

  <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:700;color:#F0F0F0;">
    One more step
  </h1>

  <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:rgba(240,240,240,0.72);">
    Confirm this address and we&#39;ll write when something matters — a new film,
    a piece, a screening, an open call.
  </p>

  <!-- A real link rather than a button image. Images are off by default in a
       lot of clients, and a confirmation nobody can see is a list that never
       grows. -->
  <a href="${escapeHtml(url)}"
     style="display:inline-block;padding:14px 26px;background:#B23495;color:#FFFFFF;text-decoration:none;border-radius:3px;font-size:14px;font-weight:600;">
    Confirm subscription
  </a>

  <p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:rgba(240,240,240,0.45);">
    If the button doesn&#39;t work, paste this into your browser:<br>
    <span style="color:rgba(240,240,240,0.6);word-break:break-all;">${escapeHtml(url)}</span>
  </p>

  <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:rgba(240,240,240,0.45);">
    If you didn&#39;t sign up, ignore this — nothing was added, and we won&#39;t
    write again.
  </p>

  <div style="margin-top:36px;padding-top:20px;border-top:1px solid rgba(240,240,240,0.08);font-size:12px;color:rgba(240,240,240,0.35);">
    Don&#39;t Skip Humanity
  </div>
</div>
</body>
</html>`;

  // The plain-text part is not optional: a message without one scores worse
  // with every major filter, and this is the one email the whole list depends
  // on arriving.
  const text = [
    "One more step",
    "",
    "Confirm this address and we'll write when something matters.",
    "",
    url,
    "",
    "If you didn't sign up, ignore this — nothing was added.",
    "",
    "Don't Skip Humanity",
  ].join("\n");

  // Best effort. The subscriber row already exists; failing the request
  // because the postman was busy would tell someone their signup did not work
  // when it did, and they would try again and hit the duplicate.
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [address],
        subject: "Confirm your Don't Skip Humanity subscription",
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[newsletter] confirmation email failed:", err);
  }
}
