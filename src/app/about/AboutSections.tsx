"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLocaleHref } from "@/contexts/LocaleContext";
import SecondaryBtn from "@/components/SecondaryBtn";
import HeroMosaic from "@/components/HeroMosaic";
import { HERO_TILES } from "@/components/heroTiles";
import type { ResolvedSection, SectionKind } from "@/lib/page-sections";

/**
 * The About page, rendered from `page_sections`.
 *
 * The copy used to be three `const` arrays in this file; it now arrives as an
 * ordered list of typed sections, already translated on the server. Every
 * section here is the same design as before — what changed is where the words
 * come from and that the editor can reorder or hide them.
 *
 * WHY THE WHOLE PAGE IS HERE, HERO INCLUDED
 *
 * `position` is meaningless if some sections are rendered by the page shell and
 * only the middle ones come from the list — moving the team above the pillars
 * would work, moving the closing band up would not. So everything between the
 * navbar and the footer is driven by the list, in the order the list gives.
 *
 * Unknown kinds render nothing rather than throwing: a section kind added in
 * the dashboard before this file knows about it should leave a gap on the page,
 * not a 500.
 */

/* ── Reading the resolved content ──
   Values arrive as plain strings (the server already picked the language), but
   they arrive as `unknown` because the shape differs per kind. These two keep
   the casts in one place instead of sprinkling them through the markup. */

function str(content: Record<string, unknown>, key: string): string {
  const v = content[key];
  return typeof v === "string" ? v : "";
}

function rows(content: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const v = content[key];
  return Array.isArray(v) ? (v.filter((r) => r && typeof r === "object") as Record<string, unknown>[]) : [];
}

function paragraphs(content: Record<string, unknown>, key: string): string[] {
  const v = content[key];
  return Array.isArray(v) ? v.filter((p): p is string => typeof p === "string" && p.trim() !== "") : [];
}

/* A hairline after these kinds, matching the page as designed. Not "after every
   section": the numbered list runs straight into the prose block, and the
   closing band draws its own top border because it has a background. */
const DIVIDER_AFTER: Record<string, boolean> = {
  hero: true,
  intro: true,
  numbered_list: false,
  split_prose: true,
  pillars: true,
  people: false,
  cta: false,
};

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  if (!children) return null;
  return (
    <p
      className={`text-[10px] uppercase font-medium ${center ? "text-center" : ""}`}
      style={{ color: "rgba(54,54,54,0.8)", letterSpacing: "0.3em" }}
    >
      {children}
    </p>
  );
}

/* ── S1 — Hero ───────────────────────────────────────────────────── */

function Hero({ content }: { content: Record<string, unknown> }) {
  const eyebrow = str(content, "eyebrow");
  const headline = str(content, "headline");
  const standfirst = str(content, "standfirst");
  const imageSrc = str(content, "imageSrc");

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 relative overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* An uploaded image replaces the drifting grid; with no image the grid
          is the background, which is how the page was designed. */}
      {imageSrc ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(1) brightness(0.42)",
          }}
        />
      ) : (
        <HeroMosaic
          mode="tiles"
          tiles={HERO_TILES}
          rows={6}
          rowHeight={215}
          dim={0.62}
          falloff={220}
          panel={false}
          speed={90}
          tileFilter="grayscale(1) brightness(0.5)"
        />
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {eyebrow && (
          <p
            className="text-[10px] uppercase font-medium text-center"
            style={{
              color: "rgba(150,150,150,0.7)",
              letterSpacing: "0.3em",
              marginBottom: 20,
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 200ms both",
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 300ms both",
          }}
        >
          {headline}
        </h1>
        {standfirst && (
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
              fontWeight: 400,
              color: "rgba(200,200,200,0.72)",
              maxWidth: 560,
              lineHeight: 1.7,
              marginTop: 24,
              marginLeft: "auto",
              marginRight: "auto",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 550ms both",
            }}
          >
            {standfirst}
          </p>
        )}
        <div
          style={{
            width: 80,
            height: 1,
            background: "#161616",
            margin: "40px auto 0",
            animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 800ms both",
          }}
        />
      </div>
    </div>
  );
}

/* ── Intro paragraph ─────────────────────────────────────────────── */

function Intro({ content }: { content: Record<string, unknown> }) {
  const body = str(content, "body");
  const ref = useReveal();
  if (!body) return null;
  return (
    <div className="max-w-[760px] mx-auto px-8" style={{ padding: "64px 32px" }}>
      <p ref={ref} className="reveal" style={{ fontSize: 16, color: "#595C5C", lineHeight: 1.75 }}>
        {body}
      </p>
    </div>
  );
}

/* ── S2 — What we do ─────────────────────────────────────────────── */

function NumberedList({ content }: { content: Record<string, unknown> }) {
  const ref = useReveal();
  const href = useLocaleHref();
  const items = rows(content, "items");

  return (
    <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
      <div ref={ref} className="reveal">
        <SectionLabel center>{str(content, "label")}</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 mt-12" style={{ gap: 0 }}>
          {items.map((col, i) => {
            const linkLabel = str(col, "linkLabel");
            const linkHref = str(col, "linkHref");
            return (
              <div
                key={i}
                className={`reveal stagger-${i + 1} text-center`}
                style={{
                  padding: "0 40px",
                  borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                }}
              >
                <p className="gradient-text" style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
                  {str(col, "num")}
                </p>
                <p style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>
                  {str(col, "title")}
                </p>
                <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, marginBottom: 16 }}>
                  {str(col, "desc")}
                </p>
                {/* A destination makes it a link; without one it stays the
                    inert label it has always been, rather than pretending. */}
                {linkLabel &&
                  (linkHref ? (
                    <Link
                      href={href(linkHref)}
                      className="text-[14px] transition-colors hover:underline"
                      style={{ color: "#1ABC9C" }}
                    >
                      {linkLabel} →
                    </Link>
                  ) : (
                    <span className="text-[14px]" style={{ color: "#1ABC9C" }}>
                      {linkLabel} →
                    </span>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── S3 — Image beside prose ─────────────────────────────────────── */

function SplitProse({ content }: { content: Record<string, unknown> }) {
  const ref = useReveal();
  const imageSrc = str(content, "imageSrc");
  const quote = str(content, "quote");
  const paras = paragraphs(content, "paragraphs");

  /* The quote sits after the opening paragraph, not at the end — it breaks the
     column the way the design does. Everything after it follows. */
  const [first, ...rest] = paras;

  return (
    <div className="max-w-[1400px] mx-auto px-8" style={{ paddingBottom: 64 }}>
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 48, alignItems: "center" }}>
        {imageSrc && (
          <div
            className="reveal-left"
            style={{
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              position: "relative",
              isolation: "isolate",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="w-full"
              style={{ display: "block", filter: "grayscale(1) brightness(0.65) contrast(1.1)" }}
            />
          </div>
        )}
        <div className="reveal-right stagger-2">
          <h2 style={{ fontSize: 36, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 24 }}>
            {str(content, "headlineNormal")}{" "}
            <span className="gradient-text">{str(content, "headlineAccent")}</span>
            <br />
            {str(content, "headlineAfter")}
          </h2>
          {first && (
            <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, marginBottom: 16 }}>{first}</p>
          )}
          {quote && (
            <div style={{ borderInlineStart: "3px solid #9B59B6", paddingInlineStart: 20, margin: "24px 0" }}>
              <p style={{ fontSize: 16, fontStyle: "italic", color: "#F0F0F0" }}>&quot;{quote}&quot;</p>
            </div>
          )}
          {rest.map((p, i) => (
            <p
              key={i}
              style={{
                fontSize: 14,
                color: "#595C5C",
                lineHeight: 1.625,
                marginBottom: i === rest.length - 1 ? 0 : 16,
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── S4 — Pillars ────────────────────────────────────────────────── */

function Pillars({ content }: { content: Record<string, unknown> }) {
  const ref = useReveal();
  const href = useLocaleHref();
  const items = rows(content, "items");
  const ctaLabel = str(content, "ctaLabel");
  const ctaHref = str(content, "ctaHref");

  return (
    <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
      <div ref={ref} className="reveal">
        <SectionLabel>{str(content, "label")}</SectionLabel>
        <h2 style={{ fontSize: 36, fontWeight: 600, marginTop: 12, marginBottom: 48 }}>
          <span style={{ color: "#FFFFFF" }}>{str(content, "headlineNormal")}</span>
          <br />
          <span style={{ color: "#1ABC9C" }}>{str(content, "headlineAccent")}</span>
        </h2>
        {items.map((pillar, i) => (
          <div
            key={i}
            className={`reveal stagger-${Math.min(i + 1, 5)} flex items-center transition-colors hover:bg-white/[0.02]`}
            style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="gradient-text flex-shrink-0" style={{ fontSize: 28, fontWeight: 700, width: 60 }}>
              {str(pillar, "num")}
            </p>
            <p style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF", width: 280, flexShrink: 0 }}>
              {str(pillar, "name")}
            </p>
            <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, flex: 1 }}>{str(pillar, "desc")}</p>
          </div>
        ))}
        {ctaLabel && (
          <div style={{ marginTop: 32 }}>
            <SecondaryBtn href={ctaHref ? href(ctaHref) : undefined}>{ctaLabel} →</SecondaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── S5 — Team ───────────────────────────────────────────────────── */

function People({ content }: { content: Record<string, unknown> }) {
  const ref = useReveal();
  const items = rows(content, "items");

  return (
    <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
      <div ref={ref} className="reveal">
        <SectionLabel>{str(content, "label")}</SectionLabel>
        <h2 style={{ fontSize: 36, fontWeight: 600, color: "#FFFFFF", marginTop: 12, marginBottom: 48 }}>
          {str(content, "headline")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((member, i) => (
            <div key={i} className={`reveal-scale stagger-${Math.min(i + 1, 5)} text-center`}>
              <div
                className="mx-auto mb-4 group"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  position: "relative",
                  isolation: "isolate",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={str(member, "imageSrc") || "/images/team-male.jpg"}
                  alt={str(member, "name")}
                  className="w-full h-full object-cover transition-all duration-500 grayscale brightness-[0.8] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.06]"
                />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#F0F0F0" }}>{str(member, "name")}</p>
              <p style={{ fontSize: 13, color: "#1ABC9C", marginTop: 4 }}>{str(member, "role")}</p>
              <p style={{ fontSize: 12, color: "#999999", marginTop: 4 }}>{str(member, "bio")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── S6 — Closing band ───────────────────────────────────────────── */

function Cta({ content }: { content: Record<string, unknown> }) {
  const href = useLocaleHref();
  const email = str(content, "email");
  const buttons = rows(content, "buttons");

  return (
    <div style={{ background: "#161616", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[600px] mx-auto text-center" style={{ padding: "64px 32px" }}>
        <p style={{ fontSize: 28, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>
          {str(content, "heading")}
        </p>
        <p style={{ fontSize: 14, color: "#595C5C", marginBottom: 24 }}>{str(content, "body")}</p>
        {email && (
          <p style={{ marginBottom: 24 }}>
            <a href={`mailto:${email}`} style={{ fontSize: 16, color: "#1ABC9C" }} className="hover:underline">
              {email}
            </a>
          </p>
        )}
        {buttons.length > 0 && (
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {buttons.map((b, i) => {
              const dest = str(b, "href");
              return (
                <SecondaryBtn
                  key={i}
                  href={dest ? (/^(https?:|mailto:|tel:)/.test(dest) ? dest : href(dest)) : undefined}
                >
                  {str(b, "label")}
                </SecondaryBtn>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── The page ────────────────────────────────────────────────────── */

const RENDERERS: Partial<
  Record<SectionKind, (p: { content: Record<string, unknown> }) => React.ReactElement | null>
> = {
  hero: Hero,
  intro: Intro,
  numbered_list: NumberedList,
  split_prose: SplitProse,
  pillars: Pillars,
  people: People,
  cta: Cta,
};

export default function AboutSections({ sections }: { sections: ResolvedSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        const Renderer = RENDERERS[section.kind];
        if (!Renderer) return null;
        const isLast = i === sections.length - 1;
        return (
          <div key={section.id}>
            <Renderer content={section.content} />
            {!isLast && DIVIDER_AFTER[section.kind] && (
              <div style={{ height: 1, background: "#161616" }} />
            )}
          </div>
        );
      })}
    </>
  );
}
