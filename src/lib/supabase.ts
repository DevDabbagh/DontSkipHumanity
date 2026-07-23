import { createClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for the landing page.
 * Uses the anon key — RLS ensures only published content is visible.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
