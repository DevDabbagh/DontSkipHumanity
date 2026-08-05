import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Read-only Supabase client for the landing page.
 * Uses the anon key — RLS ensures only published content is visible.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
