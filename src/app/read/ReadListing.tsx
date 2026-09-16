"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import SupportCTA from "@/components/SupportCTA";
import HeroMosaic from "@/components/HeroMosaic";
import { HERO_TILES } from "@/components/heroTiles";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { Article } from "@/lib/types";
import {
  EYEBROW,
  BODY_16,
  BODY_14,
  BTN_13,
  META_15,
  ArrowRight,
  Rule,
  prettyTag,
  CardMeta,
  ArticleCard,
  ShareButton,
} from "@/components/read/ArticleCard";

/**
 * Read — landing.
 *
 * Built to Figma frame `809:2560` ("DSH – Read Landing"), 1920×6023.
 *
 * WHAT CHANGED FROM THE PREVIOUS BUILD
 *
 * The old page was a 1400px container with a featured block and a plain grid,
 * and its tag colours included an emerald, an amber and a red — none of which
 * are DSH colours. The frame is a 1224px column with nine sections: the mosaic
 * hero, a featured article, a full-bleed statement band, the editorial framing
 * block, the filter row, a 3×3 grid, pagination, the support band and the
 * newsletter.
 *
 * Cards carry TWO labels, not one: a coloured chip for the kind of writing and
 * a plain word for the part of DSH it belongs to — "Opinion · Films · 23 Aug".
 * And each says up front whether it is free or behind a subscription, so a
 * reader learns that before clicking rather than after.
 */

/* The filter row in the frame. "View All" is not a category — it is the
   cleared state, so it is kept separate from the list rather than being a
   category that happens to mean "no category". */
const CATEGORIES = ["Investigation", "Essays", "Opinion", "Field notes", "Interviews", "Resources"];

const PER_PAGE = 9;

function PageArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
      <path
        d={direction === "left" ? "M11 4H1M1 4L4 1M1 4L4 7" : "M1 4h10M11 4L8 1M11 4L8 7"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReadListing({ articles }: { articles: Article[] }) {
  const href = useLocaleHref();

  const [category, setCategory] = useState<string | null>(null);
  const [access, setAccess] = useState<"free" | "subscription" | null>(null);
  const [page, setPage] = useState(0);

  /* The editor picks the featured article; without one the newest stands in,
     so the slot is never empty. */
  const featured = useMemo(
    () => articles.find((a) => a.featured) ?? articles[0],
    [articles]
  );

  const filtered = useMemo(() => {
    return articles
      .filter((a) => a.slug !== featured?.slug)
      .filter((a) => (category ? prettyTag(a.tag) === category : true))
      .filter((a) => (access ? a.access === access : true));
  }, [articles, featured, category, access]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const shown = filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  function reset(next: () => void) {
    next();
    setPage(0);
  }

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* ══ Hero — Frame 563 mosaic + Rectangle 727 panel, 128 → 774 ══ */}
      <section className="relative h-[646px] mt-[128px]">
        <HeroMosaic
          mode="tiles"
          tiles={HERO_TILES}
          rows={3}
          rowHeight={215}
          tileWidth={330}
          dim={0.62}
          falloff={220}
          panel
          speed={90}
          tileFilter="grayscale(1) brightness(0.5)"
        />

        <div className="relative h-full max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          {/* Eyebrow at y=252, headline at 290, standfirst at 558, buttons 734 */}
          <div className="absolute top-[124px] left-5 sm:left-8 xl:left-0 flex flex-col gap-[14px] items-start w-full max-w-[496px] pr-5 sm:pr-8 xl:pr-0">
            <p className={EYEBROW}>read</p>
            <h1 className="font-semibold text-[38px] leading-[40px] sm:text-[50px] sm:leading-[52px] tracking-[-1px] text-[#F0F0F0] xl:w-[489px]">
              Where DSH names systems of power and preserves{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #32C6CC, #B23495)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                testimony
              </span>
            </h1>
            <p className={`${BODY_16} text-[#595C5C] pt-[54px] max-w-[496px]`}>
              Work that names what power tries to hide — essays, interviews, and dispatches from the
              frontlines of justice.
            </p>
            <div className="flex flex-wrap gap-[24px] pt-[52px]">
              <a
                href="#articles"
                className={`flex items-center justify-center px-[14px] py-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
                style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
              >
                Read our news
              </a>
              <Link
                href={href("/support")}
                className={`flex items-center justify-center px-[14px] py-[12px] rounded-[3px] ${BTN_13} text-[#595C5C] transition-colors hover:text-[#9D9C9C]`}
                style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
              >
                Contact for collaboration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Featured article — 883:218 / 883:250, y=964 ══ */}
      {featured && (
        <section className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[190px]">
          <p className={`${EYEBROW} pb-[38px]`}>Featured article</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[70px] items-start">
            <Link href={href(`/read/${featured.slug}`)} className="block group">
              <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: "612 / 448" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.mainImage}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  style={{ filter: "grayscale(1) brightness(0.85)" }}
                />
              </div>
            </Link>

            <div className="flex flex-col max-w-[542px]">
              {featured.tag && (
                <p className={`${META_15} leading-[18px] text-[#5D94B9] pb-[30px]`}>
                  {prettyTag(featured.tag)}
                </p>
              )}
              <Link href={href(`/read/${featured.slug}`)} className="group">
                <h2 className="text-[38px] font-semibold leading-[40px] tracking-[-0.57px] text-[#F0F0F0] group-hover:text-white transition-colors">
                  {featured.title}
                </h2>
              </Link>

              {featured.author?.name && (
                <div className="flex items-center gap-[15px] pt-[40px]">
                  <span className="block size-[40px] rounded-full overflow-hidden shrink-0" style={{ background: "rgba(27,27,27,0.6)" }}>
                    {featured.author.avatar && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={featured.author.avatar} alt="" aria-hidden className="w-full h-full object-cover" />
                    )}
                  </span>
                  <span className={`${BODY_14} text-[#9D9C9C]`}>by {featured.author.name}</span>
                </div>
              )}

              <p className={`${BODY_16} text-[#595C5C] pt-[20px]`}>{featured.excerpt}</p>

              <div className="pt-[30px]">
                <CardMeta article={featured} />
              </div>

              <div className="flex items-center gap-[24px] pt-[30px]">
                <Link
                  href={href(`/read/${featured.slug}`)}
                  className={`flex items-center gap-[8px] px-[14px] py-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
                  style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
                >
                  Read now
                  <ArrowRight />
                </Link>
                <ShareButton url={href(`/read/${featured.slug}`)} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ Statement band — Frame 573 (809:3262), full bleed, y=1640 ══ */}
      <section
        className="relative mt-[180px] flex items-center"
        style={{ minHeight: 282, background: "#131313" }}
      >
        <div className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 w-full">
          <p className="text-[26px] font-semibold leading-[34px] tracking-[-0.75px] text-[#F0F0F0] max-w-[1000px]">
            Work that names what power tries to hide
            <br />— essays, interviews, and dispatches from the frontlines of justice.
          </p>
        </div>
      </section>

      {/* ══ Editorial framing — Frame 651 (809:2788), y=1922 ══ */}
      <section className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[150px]">
        <div className="max-w-[728px]">
          <p className={`${EYEBROW} pb-[14px]`}>Editorial framing</p>
          <h2 className="text-[26px] font-semibold leading-[33px] tracking-[-0.75px] text-[#F0F0F0]">
            Where DSH names systems of power and preserves testimony
          </h2>
          <p className={`${BODY_16} text-[#595C5C] pt-[20px]`}>
            Learn from activists, journalists, and cultural workers who write from inside the story —
            not at a distance from it.
          </p>
        </div>
      </section>

      {/* ══ Filters — Frame 655 (809:2751), y=2344 ══ */}
      <section id="articles" className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[100px]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <FilterChip label="View All" active={category === null} onClick={() => reset(() => setCategory(null))} />
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={category === c}
                onClick={() => reset(() => setCategory(category === c ? null : c))}
              />
            ))}
          </div>
          <div className="flex items-center gap-[10px]">
            <FilterChip
              label="Free"
              active={access === "free"}
              onClick={() => reset(() => setAccess(access === "free" ? null : "free"))}
            />
            <FilterChip
              label="Subscription"
              active={access === "subscription"}
              onClick={() => reset(() => setAccess(access === "subscription" ? null : "subscription"))}
            />
          </div>
        </div>
        <div className="pt-[15px]">
          <Rule />
        </div>
      </section>

      {/* ══ Grid — 883:261 / 883:451 / 883:646, 3 columns, gap 24 ══ */}
      <section className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[100px]">
        {shown.length === 0 ? (
          <p className={`${BODY_16} text-[#595C5C]`}>
            Nothing here yet under those filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[24px] gap-y-[80px]">
            {shown.map((a) => (
              <ArticleCard key={a.slug} article={a} href={href} />
            ))}
          </div>
        )}

        {/* ── Pagination — Frame 692 (809:3251), y=4659 ── */}
        {pageCount > 1 && (
          <div className="pt-[100px]">
            <Rule />
            <div className="flex items-center justify-between pt-[30px]">
              <button
                type="button"
                disabled={current === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={`flex items-center gap-[14px] ${BTN_13} text-[#595C5C] transition-colors hover:text-[#9D9C9C] disabled:opacity-40 disabled:hover:text-[#595C5C]`}
              >
                <PageArrow direction="left" />
                Previous page
              </button>

              <div className="flex items-center gap-[14px]">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-current={i === current ? "page" : undefined}
                    className={`${BTN_13} transition-colors`}
                    style={{ color: i === current ? "#F0F0F0" : "#595C5C" }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={current >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className={`flex items-center gap-[14px] ${BTN_13} text-[#595C5C] transition-colors hover:text-[#9D9C9C] disabled:opacity-40 disabled:hover:text-[#595C5C]`}
              >
                Next page
                <PageArrow direction="right" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ══ Support band — Group 384 (809:2621), y=4855 ══ */}
      <div className="pt-[160px]">
        <SupportCTA />
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}

/* ── A filter chip — Frame 4 / Frame 450 (809:2754 …) ──
   40px tall, 3px radius, 14px horizontal padding. The selected one takes the
   Read section's blue rather than a generic highlight. */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center h-[40px] px-[14px] rounded-[3px] ${BTN_13} transition-colors`}
      style={
        active
          ? { background: "rgba(93,148,185,0.7)", color: "#F0F0F0" }
          : { background: "rgba(27,27,27,0.4)", color: "#595C5C" }
      }
    >
      {label}
    </button>
  );
}
