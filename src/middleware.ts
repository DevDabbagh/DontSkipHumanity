import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale prefixes, without moving every page under `app/[locale]`.
 *
 * `/ar/studio` is REWRITTEN to `/studio` and the locale is passed on as the
 * `x-locale` header, which server components read. The visitor's URL stays
 * `/ar/studio`, so the page is linkable, shareable and indexable per language
 * — which was the whole point of choosing path prefixes over a cookie.
 *
 * The default locale stays unprefixed, so every existing link keeps working
 * and no page ends up served under two URLs.
 *
 * The prefix list is static here on purpose: middleware runs on every request
 * at the edge, and querying Supabase for the language list on each one would
 * put a database round-trip in front of the whole site. Adding a language in
 * the dashboard needs one line here — a deliberate, cheap trade.
 */

const LOCALE_PREFIXES = ["ar", "pt", "es", "fr", "de"];

/**
 * The default language has no prefix, so `/en/studio` is not a real page.
 * People type it anyway — it's the obvious guess once they've seen `/ar/studio`
 * — so it redirects to `/studio` instead of 404ing. A 301 rather than a rewrite:
 * one canonical URL per page, no duplicate for search engines.
 *
 * "en" is hard-coded because middleware can't reach the database. If English
 * ever stops being the default, this line changes with it.
 */
const DEFAULT_PREFIX = "en";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const seg = pathname.split("/")[1];

  if (seg === DEFAULT_PREFIX) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(seg.length + 1) || "/";
    return NextResponse.redirect(url, 301);
  }

  const locale = LOCALE_PREFIXES.includes(seg) ? seg : null;

  const headers = new Headers(req.headers);
  headers.set("x-locale", locale ?? "");
  /* The rendered path without the prefix, so pages can build switcher links
     back to the same page in another language. */
  headers.set("x-pathname", locale ? pathname.slice(seg.length + 1) || "/" : pathname);

  if (!locale) return NextResponse.next({ request: { headers } });

  const url = req.nextUrl.clone();
  url.pathname = pathname.slice(seg.length + 1) || "/";
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  /* Skip Next internals, the API routes and anything with a file extension —
     rewriting those would break assets and the newsletter endpoints. */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
