import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Who is making this request?
 *
 * THE PROBLEM THIS SOLVES
 *
 * Sign-in on this site is client-side: `@supabase/supabase-js` keeps the
 * session in the browser, not in a cookie. So a server component cannot tell
 * who is reading — `headers()` shows it nothing. That is fine for public pages
 * and fatal for a paywall, because the only place the answer exists is the
 * browser.
 *
 * The browser therefore has to say who it is, and the server has to check
 * rather than believe it. A request carries `Authorization: Bearer <token>`;
 * this asks Supabase whether that token is real and, if so, who it belongs to.
 * A forged or expired token comes back as nobody.
 *
 * WHAT NOT TO DO INSTEAD
 *
 * Never take a `user_id` out of a request body. Anyone can type someone else's
 * id into a POST, and a paywall that trusts one is not a paywall.
 *
 * THE LONGER-TERM FIX
 *
 * Moving the session into cookies with `@supabase/ssr` would let server
 * components read it directly and remove the round trip. That is a change to
 * every place auth is touched, so it is deliberately not bundled in here.
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  try {
    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch (err) {
    /* Fail closed: an unverifiable token is not a user. */
    console.warn("[reader] token verification failed", err);
    return null;
  }
}
