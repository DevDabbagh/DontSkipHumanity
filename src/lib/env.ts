/**
 * Environment variable validation.
 * NEXT_PUBLIC_* vars are inlined at build time, so we warn instead of throwing
 * to avoid crashing the entire app if something goes wrong during SSR.
 */

function getEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (!value && typeof window !== "undefined") {
    console.warn(`[env] Missing ${name} — some features may not work.`);
  }
  return value || fallback;
}

export const env = {
  supabaseUrl: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
