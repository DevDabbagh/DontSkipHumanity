import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect back to home after auth
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
