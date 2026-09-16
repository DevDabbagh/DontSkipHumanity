"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { ArticleBlock } from "@/lib/types";

/**
 * The body of an article, and the card that stands in for it.
 *
 * WHY THIS COMPONENT EXISTS
 *
 * A paywall that draws a card over the text is not a paywall. The text is
 * still in the page source, and "View source" defeats it in one keystroke.
 * So the server never sends the body of a subscription article at all — the
 * page arrives with the headline, the author, the excerpt and nothing else,
 * and this component asks `/api/read/[slug]` for the missing part using the
 * reader's own access token.
 *
 * The route decides. It returns the blocks only for a free article, or for a
 * signed-in reader with a live subscription; otherwise it returns a reason and
 * no text. Nothing here can talk it into handing the article over.
 *
 * A free article never reaches the fetch: its body comes with the page, so a
 * public piece does not depend on being signed in, and does not flash.
 */

type State =
  | { kind: "ready"; blocks: ArticleBlock[] }
  | { kind: "loading" }
  | { kind: "sign_in" }
  | { kind: "subscribe" }
  | { kind: "error"; message: string };

export default function PaywalledBody({
  slug,
  access,
  initialBody,
  render,
}: {
  slug: string;
  access: "free" | "subscription";
  initialBody: ArticleBlock[];
  render: (blocks: ArticleBlock[]) => React.ReactNode;
}) {
  const href = useLocaleHref();
  const [state, setState] = useState<State>(
    access === "free" ? { kind: "ready", blocks: initialBody } : { kind: "loading" }
  );

  useEffect(() => {
    if (access === "free") return;
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        const res = await fetch(`/api/read/${encodeURIComponent(slug)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });

        if (!alive) return;

        if (res.ok) {
          const json = await res.json();
          setState({ kind: "ready", blocks: Array.isArray(json.body) ? json.body : [] });
          return;
        }
        if (res.status === 401) return setState({ kind: "sign_in" });
        if (res.status === 402) return setState({ kind: "subscribe" });
        setState({ kind: "error", message: "This article could not be loaded." });
      } catch {
        if (alive) setState({ kind: "error", message: "This article could not be loaded." });
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, access]);

  if (state.kind === "ready") return <>{render(state.blocks)}</>;

  if (state.kind === "loading") {
    return (
      <div className="py-10">
        <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] text-[#595C5C]">
          Opening the article…
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="py-10">
        <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] text-[#595C5C]">
          {state.message}
        </p>
      </div>
    );
  }

  /* ── The preview, the fade, then the card ──
     The few paragraphs above the fade were cut on the server (`previewOf` in
     page.tsx) — the gradient is the *look* of the cut, not the cut itself.
     Fading text that is fully present would be theatre; here there is genuinely
     nothing below it to reveal. */
  const needsSignIn = state.kind === "sign_in";

  return (
    <div className="py-10">
      {initialBody.length > 0 && (
        <div className="relative">
          {render(initialBody)}
          {/* The fade. `pointer-events-none` so it never swallows a click on
              the text it sits over. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.75) 55%, #0D0D0D 100%)",
            }}
          />
        </div>
      )}
      <div className={initialBody.length > 0 ? "-mt-[40px] relative" : ""}>
      <div
        className="mx-auto w-full max-w-[420px] rounded-[6px] p-[30px]"
        style={{
          background: "rgba(19,19,19,0.92)",
          border: "1.5px solid rgba(240,240,240,0.1)",
          boxShadow: "0px 6px 20px 2px rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
        }}
      >
        <p className="text-[11px] font-normal leading-[24px] tracking-[1.76px] uppercase text-[#363636]">
          Monthly
        </p>
        <p className="text-[22px] font-semibold leading-[28px] tracking-[-0.5px] text-[#F0F0F0] pt-[6px]">
          Get your subscription or membership
        </p>
        <p className="font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px] text-[#595C5C] pt-[8px]">
          {needsSignIn
            ? "Sign in to read this article. All access to our articles and associated newsletters."
            : "All access to our articles and associated newsletters."}
        </p>

        <Link
          href={href(needsSignIn ? "/support?type=monthly" : "/support?type=monthly")}
          className="mt-[24px] flex items-center justify-center gap-[7px] h-[44px] rounded-[3px] text-[13px] font-medium text-[#F0F0F0] transition-opacity hover:opacity-90"
          style={{
            border: "1px solid rgba(240,240,240,0.2)",
            backgroundImage:
              "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
          }}
        >
          Subscribe now
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path
              d="M6.5 1l1.6 3.4 3.6.5-2.6 2.6.6 3.6-3.2-1.7-3.2 1.7.6-3.6L1.3 4.9l3.6-.5L6.5 1z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {needsSignIn && (
          <p className="text-center pt-[14px] text-[13px] text-[#595C5C]">
            Already a subscriber?{" "}
            <Link href={href("/profile")} className="text-[#32C6CC] hover:underline">
              Sign in
            </Link>
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
