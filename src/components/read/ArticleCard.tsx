"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";

/**
 * The pieces the Read listing and the Read details page share.
 *
 * Pulled out of `ReadListing.tsx` when the details page (frame `809:3299`)
 * turned out to reuse the same card, the same meta line and the same
 * share button under "Related articles". One card, not a copy that drifts.
 */

/* ── Type ramp, from the frames' named styles ────────────────────────── */
export const EYEBROW =
  "text-[11px] font-normal leading-[24px] tracking-[1.76px] uppercase text-[#363636]";
export const BODY_16 =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px]";
export const BODY_14 =
  "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";
export const BTN_13 = "text-[13px] font-medium";
export const META_15 = "text-[15px] leading-[15px]";

/* Category colours (Team Brief §4b) — the second label on a card is coloured
   by the part of DSH it belongs to. Anything unlisted stays neutral. */
const SECTION_COLOURS: Record<string, string> = {
  films: "#B23495",
  film: "#B23495",
  studio: "#8665A7",
  academy: "#32C6CC",
  read: "#5D94B9",
  series: "#32C6CC",
};
export function sectionColour(section: string): string {
  return SECTION_COLOURS[section.trim().toLowerCase()] ?? "#9D9C9C";
}

export function ArrowRight({ size = 6 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 6 8.4" fill="none" aria-hidden>
      <path d="M1 1l4 3.2-4 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A rule drawn as a shadow on a zero-height element, the way the frame draws
   it — a 1px block would add itself to every stack it sits in. */
export function Rule() {
  return <div className="h-0 w-full" style={{ boxShadow: "0 -1px 0 0 rgba(240,240,240,0.1)" }} />;
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function prettyTag(tag: string) {
  if (!tag) return "";
  const words = tag.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* ── The meta line every card carries — Frame 807 (883:338) ──
   chip · section · date · access. Each piece is left out when it is empty,
   so a half-filled article shows a short line rather than stray separators. */
export function CardMeta({ article }: { article: Article }) {
  const paid = article.access === "subscription";
  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      {article.tag && (
        <span
          className="flex items-center justify-center px-[8px] py-[5px] rounded-[3px] text-[12px] leading-[15px] font-medium text-[#F0F0F0]"
          style={{ background: "rgba(93,148,185,0.7)" }}
        >
          {prettyTag(article.tag)}
        </span>
      )}
      {article.section && <span className={`${META_15} text-[#9D9C9C]`}>{article.section}</span>}
      {article.date && <span className={`${META_15} text-[#595C5C]`}>{formatDate(article.date)}</span>}
      <span
        className="text-[12px] leading-[15px] font-medium"
        style={{ color: paid ? "#B23495" : "#595C5C" }}
      >
        {paid ? "Subscription only" : "Free article"}
      </span>
    </div>
  );
}

/* ── One grid card — Frame 409 (883:262) ── */
export function ArticleCard({ article, href }: { article: Article; href: (p: string) => string }) {
  const to = href(`/read/${article.slug}`);
  return (
    <article className="flex flex-col">
      <Link href={to} className="block group">
        <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: "392 / 250" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.mainImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ filter: "grayscale(1) brightness(0.8)" }}
          />
        </div>
      </Link>

      <div className="pt-[40px]">
        <CardMeta article={article} />
      </div>

      <Link href={to} className="block pt-[25px] group">
        <h3 className="text-[26px] font-semibold leading-[30px] tracking-[-0.75px] text-[#F0F0F0] group-hover:text-white transition-colors">
          {article.title}
        </h3>
      </Link>

      <p className={`${BODY_16} text-[#595C5C] pt-[20px]`}>{article.excerpt}</p>

      {article.author?.name && (
        <p className={`${BODY_14} text-[#595C5C] pt-[30px]`}>by {article.author.name}</p>
      )}

      <div className="flex items-center gap-[24px] pt-[40px]">
        <Link
          href={to}
          className={`flex items-center gap-[8px] px-[14px] py-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
          style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
        >
          Read now
          <ArrowRight />
        </Link>
        <ShareButton url={to} />
      </div>
    </article>
  );
}

/* The frame labels this "Share article???" — the question marks are the
   designer asking what it should do, not copy. It copies the link and says so,
   which is the one behaviour that needs no service and no decision. */
export function ShareButton({
  url,
  label = "Share article",
  className,
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        const full = url.startsWith("http") ? url : `${window.location.origin}${url}`;
        navigator.clipboard
          ?.writeText(full)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
          .catch(() => {});
      }}
      className={className ?? `${BTN_13} text-[#595C5C] hover:text-[#9D9C9C] transition-colors`}
    >
      {copied ? "Link copied" : label}
    </button>
  );
}
