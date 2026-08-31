"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroMosaic from "@/components/HeroMosaic";
import Newsletter from "@/components/Newsletter";
import SupportCTA from "@/components/SupportCTA";
import { useScrollColorize } from "@/hooks/useScrollColorize";
import { useT } from "@/contexts/LocaleContext";
import type { AcademyProgram } from "@/lib/types";
import type { AcademyHeader } from "@/lib/landing";

/**
 * Academy landing — Figma frame 710:1690 (1920 × 7574).
 *
 * Built to the same skeleton as the Studio listing, because the frames share
 * one: a 645px mosaic hero, a 1224px content column inset 348px from a 1920
 * canvas, and the shared SupportCTA / Newsletter / Footer at the end.
 *
 * Section map, by the frame's own y coordinates:
 *   129   hero (mosaic 1920×645)
 *   964   "What we offer" — five numbered ways in
 *   1592  featured course
 *   2458  full-width band
 *   2740  "What we aim" — programs heading, filters, 3×3 grid, pagination
 *   5358  "free by principle" band
 *   5732  newsletter
 *   6309  support CTA + footer
 */

/* ── Shared chrome, matched to the Studio page so the two read as one site ── */

const CARD_BORDER = "border-[1.5px] border-[rgba(240,240,240,0.1)] rounded-[6px]";
/* Figma's "boxes shadows" effect is spread 2. Its generated CSS says 0 —
   the effect list is the authority, as on the episode gallery. */
const CARD_SHADOW = "0px 6px 20px 2px rgba(0,0,0,0.5)";

const GLASS_BTN =
  "backdrop-blur-[3px] bg-[rgba(27,27,27,0.2)] border border-[rgba(240,240,240,0.2)] rounded-[3px] " +
  "inline-flex items-center justify-center gap-[6px] px-[14px] py-[12px] text-[13px] leading-[16px] font-medium " +
  "text-[rgba(240,240,240,0.4)] hover:text-[rgba(240,240,240,0.6)] hover:border-[rgba(240,240,240,0.3)] transition-colors";

/* Filter pill — active is the Academy teal at 70%, per Figma 710:1904 */
const PILL_BASE =
  "px-[14px] py-[12px] rounded-[3px] text-[13px] leading-[16px] font-medium transition-colors whitespace-nowrap";
const PILL_ON = `${PILL_BASE} backdrop-blur-[3px] bg-[rgba(50,198,204,0.7)] text-[#F0F0F0]`;
const PILL_OFF = `${PILL_BASE} bg-[rgba(27,27,27,0.4)] text-[#595C5C] hover:text-[#8B8F8F]`;

const BODY =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";

const EYEBROW = "text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#363636]";

/* Teal is the Academy's colour throughout the frame; #BCCB2E marks "free". */
const TEAL = "#32C6CC";
const FREE = "#BCCB2E";

const TYPE_LABELS: Record<string, string> = {
  course: "Courses",
  workshop: "Workshops",
  toolkit: "Toolkits",
  masterclass: "Masterclasses",
  mentorship: "Mentorships",
  resource: "Toolkits",
};

/* ── "What we offer" — Figma 730:1308 … 730:1458 ────────────────────
   Five rows, 78 tall on a 128px pitch. Copy is the frame's; two entries
   still carry Tiago's "(need more text)" note, kept verbatim rather than
   invented so the gap stays visible to whoever writes the real copy. */
const WAYS_IN = [
  {
    n: "01",
    title: "Courses & masterclasses",
    body: "Learn from activists, journalists, and cultural workers on the frontlines.",
  },
  {
    n: "02",
    title: "Toolkits & resources",
    body: "Practical guides on advocacy, storytelling, and naming systems of power. Free to download.",
  },
  {
    n: "03",
    title: "Workshops & live trainings",
    body: "Hands-on sessions to sharpen organising and storytelling skills.",
  },
  {
    n: "04",
    title: "Community learning spaces",
    body: "Digital and in-person gatherings to build knowledge together.",
  },
  {
    n: "05",
    title: "Mentorships & collaborations",
    body: "Connect with grassroots movements and experienced practitioners.",
  },
];

export default function AcademyListing({
  programs,
  header,
}: {
  programs: AcademyProgram[];
  header?: AcademyHeader;
}) {
  const t = useT();

  /* Header copy is editable from the dashboard; the literals are the Figma
     defaults and are what shows until someone overrides them. */
  const h = {
    /* The file exists (1920×645, the mosaic sheet size HeroMosaic expects) but
       it is currently a copy of Studio's wall — the Academy frame's own mosaic,
       Figma `710:1691`, was never exported. Same photos, right dimensions, so
       the hero renders correctly; swapping in the real export later is a
       file replacement and nothing else. The dashboard can override it today. */
    imageSrc: header?.imageSrc?.trim() || "/images/academy-hero-mosaic.png",
    titleNormal: header?.titleNormal?.trim() || "Knowledge",
    titleColored: header?.titleColored?.trim() || "is power.",
    titleAfter: header?.titleAfter?.trim() || "Education is resistance.",
    description:
      header?.description?.trim() ||
      "Political education built as infrastructure — a digital school, a living archive, and a space for collective learning. We share frameworks, tools, and resources to turn ideas into organised action.",
  };

  /* Scroll-linked black-and-white → colour, as on Films and Studio. The hero
     mosaic is deliberately left out of it. */
  const colorizeRef = useScrollColorize<HTMLElement>();

  const featured = programs[0] ?? null;
  const rest = featured ? programs.filter((p) => p.id !== featured.id) : programs;

  const [typeFilter, setTypeFilter] = useState<"all" | string>("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  const typeTabs = useMemo(() => {
    const present = Array.from(new Set(programs.map((p) => p.type)));
    return [
      { value: "all", label: "View All" },
      ...present.map((v) => ({ value: v, label: TYPE_LABELS[v] ?? v })),
    ];
  }, [programs]);

  const listRef = useRef<HTMLDivElement>(null);

  /* Scroll the window rather than `scrollIntoView`, so the 128px fixed navbar
     can be subtracted — otherwise the first row lands underneath it. */
  const jumpToList = () => {
    const el = listRef.current;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 128,
      behavior: "smooth",
    });
  };

  const filtered = rest.filter((p) => {
    const typeOk = typeFilter === "all" || p.type === typeFilter;
    const priceOk =
      priceFilter === "all" || (priceFilter === "free" ? p.isFree : !p.isFree);
    return typeOk && priceOk;
  });

  return (
    <main ref={colorizeRef} className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — frame y129→774 (645 tall). Same construction as the
          Studio hero: mosaic sheet, copy block 124px below the navbar.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[645px] mt-[128px]">
        <HeroMosaic mode="sheet" src={h.imageSrc} sheetWidth={1920} sheetHeight={645} dim={0.55} />

        <div className="relative h-full max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          <div className="absolute top-[124px] left-5 sm:left-8 xl:left-0 flex flex-col gap-[60px] w-full max-w-[496px] pr-5 sm:pr-8 xl:pr-0">
            <div className="flex flex-col gap-[14px] items-start">
              <p className={EYEBROW}>{t("academy.eyebrow")}</p>
              {/* 50/52, -1px, 489 wide — H1_Desktop_DSH */}
              <h1 className="font-semibold text-[38px] leading-[40px] sm:text-[50px] sm:leading-[52px] tracking-[-1px] text-[#F0F0F0] xl:w-[489px]">
                {h.titleNormal}
                <br />
                <GradientRun text={h.titleColored} />
                <br />
                <GradientRun text={h.titleAfter} />
              </h1>
            </div>

            <p className={BODY}>{h.description}</p>

            <div className="flex flex-wrap items-center gap-[24px]">
              <button onClick={jumpToList} className={GLASS_BTN}>
                {t("academy.discoverCourses")}
              </button>
              <Link href="/about" className={GLASS_BTN}>
                {t("common.getInTouch")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT WE OFFER — frame y964. Left column 484 wide at the
          container's start; the five rows begin 625px in (x973 of
          1224) and run to the container's right edge.
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[190px]">
        <div className="flex flex-col xl:flex-row gap-[60px] xl:gap-0">
          {/* Left — eyebrow, H3, body, "Free by principle." */}
          <div className="flex flex-col gap-[30px] items-start xl:w-[484px] shrink-0">
            <div className="flex flex-col gap-[14px] items-start w-full">
              <p className={EYEBROW}>{t("academy.whatWeOffer")}</p>
              <div className="flex flex-col gap-[20px] items-start w-full">
                <h2 className="font-semibold text-[24px] leading-[28px] sm:text-[30px] sm:leading-[33px] tracking-[-0.75px] text-white">
                  Five ways in – from a single toolkit
                  <br className="hidden sm:block" /> to a six-month mentorship.
                </h2>
                <p className={BODY}>
                  Every Academy workshop to date has been free, and keeping the Academy
                  accessible is part of its politics – knowledge shouldn’t sit behind a
                  wall. If some future program carries a cost, we hold scholarship places
                  and offer staggered payment, so cost is never the barrier.
                </p>
              </div>
            </div>
            {/* Subs informations — Inter SemiBold 16/20, teal */}
            <p className="font-semibold text-[16px] leading-[20px]" style={{ color: TEAL }}>
              Free by principle.
            </p>
          </div>

          {/* Right — the five rows. 128px pitch = 78 tall + 50 gap. */}
          <div className="flex flex-col gap-[50px] xl:ms-[141px] xl:w-[599.5px]">
            {WAYS_IN.map((w) => (
              <div key={w.n} className="flex gap-[50px] items-center xl:ps-[40px] h-[78px]">
                {/* Number + the 70px rule, 64 wide with the two pushed apart */}
                <div className="flex items-center justify-between w-[64px] shrink-0">
                  <span
                    className="text-[11px] leading-[24px] tracking-[1.76px] uppercase"
                    style={{ color: TEAL }}
                  >
                    {w.n}
                  </span>
                  <span
                    aria-hidden
                    className="block w-px h-[70px]"
                    style={{ backgroundColor: "rgba(240,240,240,0.1)" }}
                  />
                </div>
                <div className="flex flex-col gap-[10px] items-start xl:pe-[40px] xl:w-[484px]">
                  <p className="font-semibold text-[16px] leading-[20px] text-white">{w.title}</p>
                  <p className={BODY}>{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED COURSE — frame y1592. Eyebrow over a 612×448 still
          on the left, 541-wide text column on the right.
         ═══════════════════════════════════════════════════════════ */}
      {featured && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[358px]">
          <p className={`${EYEBROW} mb-[38px]`}>{t("academy.featured")}</p>
          <div className="flex flex-col xl:flex-row gap-[40px] xl:gap-[70px] items-start">
            {/* Still — 612×448, same chrome as every image card */}
            <div
              className={`relative overflow-hidden shrink-0 w-full xl:w-[612px] h-[280px] sm:h-[380px] xl:h-[448px] ${CARD_BORDER}`}
              style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
            >
              {featured.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-colorize
                  src={featured.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>

            {/* Text column — 541 wide, gap 50 to the buttons */}
            <div className="flex flex-col gap-[50px] items-start xl:w-[541px]">
              <div className="flex flex-col gap-[20px] items-start w-full">
                <div className="flex flex-col gap-[40px] items-start w-full">
                  <div className="flex flex-col gap-[20px] items-start w-full">
                    <div className="flex flex-col gap-[30px] items-start w-full">
                      {/* Category + year — 15/18 teal, 12 medium grey */}
                      <div className="flex gap-[6px] items-center">
                        <span className="text-[15px] leading-[18px]" style={{ color: TEAL }}>
                          {TYPE_LABELS[featured.type] ?? featured.type}
                        </span>
                        {featured.dates && (
                          <span className="text-[12px] font-medium text-[#595C5C]">
                            {featured.dates}
                          </span>
                        )}
                      </div>
                      {/* H2 — 38/40, -0.57px */}
                      <h3 className="font-semibold text-[30px] leading-[34px] sm:text-[38px] sm:leading-[40px] tracking-[-0.57px] text-[#F0F0F0]">
                        {featured.title}
                      </h3>
                    </div>
                    <p className={BODY}>{featured.description}</p>
                  </div>

                  {/* LED BY — 10/24 +1.6px eyebrow over a 15/18 name */}
                  {featured.whoLeads && (
                    <div className="flex flex-col gap-[10px] items-start justify-center">
                      <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
                        {t("academy.ledBy")}
                      </p>
                      <p className="text-[15px] leading-[18px] text-[#F0F0F0]">
                        {featured.whoLeads}
                      </p>
                    </div>
                  )}
                </div>

                <ProgramMeta program={featured} solidChip />
              </div>

              <div className="flex gap-[24px] items-center">
                <Link href={`/course/${featured.slug}`} className={GLASS_BTN}>
                  {t("academy.enroll")}
                  <Caret />
                </Link>
                <Link
                  href={`/course/${featured.slug}`}
                  className="text-[13px] leading-[16px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
                >
                  {t("common.knowMore")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          BAND — frame y2458, 282 tall, full-bleed with a rounded left
          edge. Photo at 10% luminosity under a teal wash.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden h-[180px] sm:h-[230px] lg:h-[282px] flex items-center mt-[282px] rounded-s-[6px]">
        <div aria-hidden className="absolute inset-0 bg-[#0D0D0D]" />
        {h.imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={h.imageSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-10"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(270deg, rgba(50,198,204,0.14) 0%, rgba(50,198,204,0.05) 40%, transparent 72%)",
          }}
        />
        <div className="relative w-full max-w-[1920px] mx-auto ps-5 sm:ps-8 xl:ps-[357px] pe-5 sm:pe-8 xl:pe-[35px]">
          <h2 className="font-semibold text-[22px] leading-[26px] sm:text-[30px] sm:leading-[34px] lg:text-[38px] lg:leading-[40px] tracking-[-0.57px] text-[#F0F0F0]">
            docuseries, videocasts, podcasts, and series,
            <br />
            plus the production and co-production
          </h2>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROGRAMS — heading (y2740), filters (y3162), grid (y3317),
          pagination (y5162).
         ═══════════════════════════════════════════════════════════ */}
      <div ref={listRef} className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 scroll-mt-[128px]">
        {/* Heading block — pt150 pb100 in the frame */}
        <div className="pt-[150px] pb-[100px]">
          <div className="flex flex-col gap-[14px] items-start xl:w-[593px]">
            <p className={EYEBROW}>{t("academy.whatWeAim")}</p>
            <div className="flex flex-col gap-[20px] items-start w-full">
              <h2 className="font-semibold text-[24px] leading-[28px] sm:text-[30px] sm:leading-[33px] tracking-[-0.75px] text-white">
                Education that names power
                <br className="hidden sm:block" /> and builds capacity.
              </h2>
              <p className={BODY}>
                Courses, workshops, toolkits, and fellowships — all free by principle.
                Built for filmmakers, journalists, organisers, and anyone who believes
                storytelling should serve justice.
              </p>
            </div>
          </div>
        </div>

        {/* Filters — chips left, Free/Paid right, 1.5px rule under, pb100 */}
        <div className="flex flex-col gap-[15px] items-start pb-[100px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
            <div className="flex flex-wrap items-center gap-[10px]">
              {typeTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setTypeFilter(tab.value)}
                  className={typeFilter === tab.value ? PILL_ON : PILL_OFF}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-[10px]">
              {(["free", "paid"] as const).map((v) => (
                <button
                  key={v}
                  /* Clicking the active one clears it — otherwise there is no
                     way back to "all" once a price filter is on. */
                  onClick={() => setPriceFilter((cur) => (cur === v ? "all" : v))}
                  className={priceFilter === v ? PILL_ON : PILL_OFF}
                >
                  {v === "free" ? t("academy.free") : t("academy.paid")}
                </button>
              ))}
            </div>
          </div>
          <span
            aria-hidden
            className="block w-full h-[1.5px]"
            style={{ backgroundColor: "rgba(240,240,240,0.1)" }}
          />
        </div>

        {/* Grid — 3 columns of 392 with a 24 gutter, 80 between rows */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-[24px] gap-y-[80px]">
            {filtered.map((p) => (
              <ProgramCard key={p.id} program={p} t={t} />
            ))}
          </div>
        ) : (
          <p className={`${BODY} py-10`}>{t("academy.noneMatch")}</p>
        )}

        {/* Pagination rule — the frame shows a paged control; with every
            program on one page the rule alone is what carries over. */}
        <div className="pt-[30px] pb-[150px]">
          <span
            aria-hidden
            className="block w-full h-[1.5px]"
            style={{ backgroundColor: "rgba(240,240,240,0.1)" }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FREE BY PRINCIPLE — frame y5358, 374 tall, centred 888/620.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[#0D0D0D]" />
        {h.imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={h.imageSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-15"
          />
        )}
        <div className="relative flex flex-col items-center">
          <div className="w-full max-w-[1000px] px-5 sm:px-[56px] py-[70px] sm:py-[100px]">
            <div className="flex flex-col gap-[14px] items-center">
              <p className="text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#595C5C] text-center">
                {t("academy.freeByPrinciple")}
              </p>
              <h2 className="font-semibold text-[24px] leading-[28px] sm:text-[30px] sm:leading-[33px] tracking-[-0.75px] text-[#F0F0F0] text-center max-w-[888px]">
                Keeping the Academy accessible is part of its politics. Knowledge
                shouldn’t sit behind a wall.
              </h2>
            </div>
            <div className="flex flex-col items-center pt-[20px]">
              <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24.8px] text-[#595C5C] text-center max-w-[620px]">
                Every workshop to date has been free. If some future program ever carries
                a cost, we hold scholarship places and offer staggered payment — so cost
                is never the barrier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter and the support CTA are the site-wide components the frame
          reuses verbatim, so they are shared here rather than rebuilt. */}
      <Newsletter />
      <SupportCTA />
      <Footer />
    </main>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────── */

/** One line of the headline painted with the teal→magenta gradient. */
function GradientRun({ text }: { text: string }) {
  return (
    <span
      style={{
        background: "linear-gradient(90deg, #32C6CC, #B23495)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {text}
    </span>
  );
}

/** The 5.86×8.19 caret Figma puts inside the enrol button. */
function Caret() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden>
      <path
        d="M1 1L5 4.5L1 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Category chip + enrolment + price line — Figma 740:1694.
 *
 * `solidChip` is the featured block's variant: there the chip is flat #363636,
 * in the grid it is the Academy teal at 70%.
 */
function ProgramMeta({
  program,
  solidChip = false,
}: {
  program: AcademyProgram;
  solidChip?: boolean;
}) {
  const priceLabel = program.isFree
    ? "Free course"
    : program.scholarshipNote?.trim()
      ? "Scholarship available"
      : "Paid course";

  return (
    <div className="flex gap-[14px] items-center">
      <span
        className="px-[8px] py-[5px] rounded-[3px] text-[12px] font-medium text-[#F0F0F0]"
        style={{ backgroundColor: solidChip ? "#363636" : "rgba(50,198,204,0.7)" }}
      >
        {TYPE_LABELS[program.type] ?? program.type}
      </span>
      <span className="flex gap-[10px] items-center text-[12px] font-medium">
        <span style={{ color: TEAL }}>{program.enrolledCount} enrolled</span>
        <span style={{ color: program.isFree ? FREE : "#595C5C" }}>{priceLabel}</span>
      </span>
    </div>
  );
}

/** One program card — Figma 741:1827 (392 × 523). */
function ProgramCard({
  program,
  t,
}: {
  program: AcademyProgram;
  t: (key: string) => string;
}) {
  return (
    <article className="flex flex-col gap-[30px] items-start">
      {/* Still — 392×250, 1.5px border, 6px radius, spread-2 shadow */}
      <div
        className={`relative overflow-hidden w-full h-[250px] ${CARD_BORDER}`}
        style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
      >
        {program.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-colorize
            src={program.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-[40px] items-start w-full">
        <div className="flex flex-col gap-[20px] items-start w-full">
          <div className="flex flex-col gap-[20px] items-start w-full">
            <ProgramMeta program={program} />
            <div className="flex flex-col gap-[10px] w-full">
              {/* 20/28 semibold — Mobile/H2_Mobile_DSH in the frame */}
              <h3 className="font-semibold text-[20px] leading-[28px] text-[#F0F0F0]">
                {program.title}
              </h3>
              <p className="font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px] text-[#595C5C]">
                {program.description}
              </p>
            </div>
          </div>

          {/* Duration · by Author — 14/20, the word "by" in #363636 */}
          <div className="flex gap-[10px] items-center font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]">
            {program.duration && (
              <span style={{ color: TEAL }} className="whitespace-nowrap">
                {program.duration}
              </span>
            )}
            {program.whoLeads && (
              <span className="text-[#F0F0F0]">
                <span className="text-[#363636]">by</span>&nbsp;&nbsp;{program.whoLeads}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-[24px] h-[40px] items-center">
          <Link href={`/course/${program.slug}`} className={GLASS_BTN}>
            {t("academy.enroll")}
            <Caret />
          </Link>
          <Link
            href={`/course/${program.slug}`}
            className="text-[13px] leading-[16px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
          >
            {t("common.knowMore")}
          </Link>
        </div>
      </div>
    </article>
  );
}
