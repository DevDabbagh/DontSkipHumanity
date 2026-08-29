import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. **Bypasses every RLS policy.**
 *
 * Only for server routes that have already established the truth some other
 * way — e.g. recording a donation *after* verifying the payment directly with
 * Stripe. Never import this from a client component; `server-only` turns that
 * into a build error rather than a silent leak.
 *
 * Why the service role at all: `donations` is admin-only by RLS (006), and the
 * donor is a logged-out visitor. The anon key cannot write the row, and giving
 * `anon` an insert policy would let anyone POST fake donations.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin client needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — see .env.example."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
