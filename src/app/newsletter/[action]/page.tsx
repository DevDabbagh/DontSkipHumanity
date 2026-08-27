import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Landing pages for the two links that appear inside newsletter emails:
 *
 *   /newsletter/confirm?token=…       completes double opt-in
 *   /newsletter/unsubscribe?token=…   one-click opt-out
 *
 * Both act on the token alone — no login, no typing an address back in.
 * Anything that makes unsubscribing harder pushes people to hit "spam"
 * instead, which costs far more than the lost subscriber.
 *
 * The work happens in SQL functions; this page only reports the outcome.
 */

export const dynamic = "force-dynamic";

const COPY = {
  confirm: {
    ok: {
      title: "You're on the list.",
      body: "One email when something matters — a new film, a piece, a screening, an open call.",
    },
    fail: {
      title: "That link has expired.",
      body: "Confirmation links can only be used once. Sign up again and we'll send a fresh one.",
    },
  },
  unsubscribe: {
    ok: {
      title: "You've been unsubscribed.",
      body: "You won't receive the newsletter again. No hard feelings — the work stays free to read either way.",
    },
    fail: {
      title: "We couldn't find that subscription.",
      body: "It may already have been removed. If you keep receiving emails, reply to one and we'll sort it out.",
    },
  },
} as const;

export default async function NewsletterActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ action: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { action } = await params;
  const { token } = await searchParams;

  const kind = action === "confirm" || action === "unsubscribe" ? action : null;

  let ok = false;
  if (kind && token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase.rpc(
        kind === "confirm" ? "newsletter_confirm" : "newsletter_unsubscribe",
        { p_token: token }
      );
      ok = data === true;
    }
  }

  const copy = kind ? COPY[kind][ok ? "ok" : "fail"] : COPY.confirm.fail;

  return (
    <main className="bg-[#0D0D0D] min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-5 py-[160px]">
        <div className="max-w-[520px] text-center flex flex-col gap-[20px]">
          <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
            Newsletter
          </p>
          <h1 className="text-[30px] sm:text-[38px] leading-[34px] sm:leading-[40px] tracking-[-0.57px] font-semibold text-white">
            {copy.title}
          </h1>
          <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#9D9C9C]">
            {copy.body}
          </p>
          <Link
            href="/"
            className="text-[13px] font-medium text-[#8665A7] hover:opacity-80 mt-[10px]"
          >
            Back to Don&rsquo;t Skip Humanity
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
