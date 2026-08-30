import "server-only";

/**
 * Where to send someone back to after Stripe.
 *
 * Order matters:
 *
 *   1. NEXT_PUBLIC_SITE_URL — explicit wins. Set it and this is what is used.
 *   2. the domain the request actually arrived on — so the donor returns to
 *      the site they were on, whichever domain that is.
 *   3. localhost, for `next dev`.
 *
 * Step 2 is the point. The domain is expected to change when DSH hand over
 * their real one, and a stale env var fails silently: checkout still works,
 * the donor just gets returned to the old address. Deriving from the request
 * means a domain change needs no configuration at all.
 *
 * `Host` is attacker-controlled, so the derived value is only trusted when it
 * is a plain hostname over https (or localhost). That keeps a forged header
 * from turning our success URL into someone else's site.
 */
export function resolveSiteUrl(req: Request): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";

  const isLocal = /^localhost(:\d+)?$/.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host);
  /* Hostname only: letters, digits, dots, hyphens — and an optional port.
     Anything with a slash, @, or whitespace is a forged header, not a host. */
  const looksLikeHost = /^[a-z0-9.-]+(:\d+)?$/i.test(host);

  if (isLocal) return `http://${host}`;
  if (looksLikeHost && proto === "https") return `https://${host}`;

  /* Nothing trustworthy — fall back rather than build a URL from junk. */
  return "http://localhost:3000";
}
