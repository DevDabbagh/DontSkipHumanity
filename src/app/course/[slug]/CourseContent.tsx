"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import SupportCTA from "@/components/SupportCTA";
import { useLocaleHref } from "@/contexts/LocaleContext";
import { slugifyName } from "@/lib/slug";
import { useState } from "react";
import type { AcademyProgram } from "@/lib/types";

/**
 * Academy — course details.
 *
 * Built to Figma frame `710:2045` ("DSH – Academy course details"), 1920×5993.
 *
 * WHAT CHANGED FROM THE PREVIOUS BUILD
 *
 * The old page had five sections — hero, an info bar, a two-column body, a
 * price box and related programmes — in a 1400px container with pill-shaped
 * chips and, in the type colours, an emerald and an amber that are not DSH
 * colours at all. The frame has fourteen sections in a 1224px column.
 *
 * Added here, none of which existed: the meta row under the hero, the
 * "Free by principle" callout, the testimonials carousel, the three course
 * partnership blocks, the share row, the support band, and the newsletter.
 *
 * The 1224px column sits at x=348 in a 1920 frame — (1920−1224)/2 — so it is
 * centred, and the left text column inside it is 699px with the price card
 * floated to its right at x=1170 (822px into the column).
 */

/* ── Type ramp, from the frame's named styles ──────────────────────────
   H6_IntroTitles  Inter 400 · 11/24 · 1.76px · uppercase   section eyebrows
   H2_Desktop      Inter 600 · 38/40 · -0.57px              page headline
   H4_Desktop      Inter 600 · 26/26 · -0.75px              price, card titles
   Body-Medium     Source Sans 3 400 · 16/24 · -0.08px
   Body-Small      Source Sans 3 400 · 14/20
   Author&Category Inter 400 · 15/18                        the type label
   Btn_SM          Inter 500 · 13                            buttons */

const EYEBROW =
  "text-[11px] font-normal leading-[24px] tracking-[1.76px] uppercase text-[#363636]";
const BODY_16 =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px]";
const BODY_14 =
  "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";
const BTN_13 = "text-[13px] font-medium";

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  in_person: "In Person",
  hybrid: "Hybrid",
  self_paced: "Self-Paced",
  downloadable: "Downloadable",
};

/* ── Icons ─────────────────────────────────────────────────────────────
   Drawn rather than linked: Figma's exported asset URLs expire after seven
   days, so a build that referenced them would break a week later. */

function ArrowRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.17} viewBox="0 0 12 14" fill="none" aria-hidden>
      <path d="M1 7h10M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" aria-hidden>
      <circle cx="9" cy="7.5" r="6.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9 4.2v3.5l2.3 1.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden>
      <path d="M3 1.5l11 5.5-11 5.5V1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7.6 12.3l3 3 5.8-6.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11.2" stroke="currentColor" strokeWidth="1.1" />
      <rect x="7.8" y="11" width="8.4" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.7 11V9.4a2.3 2.3 0 014.6 0V11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1.5v8m0 0L4 6.6M7 9.5l3-2.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.8 10.4v1a1.6 1.6 0 001.6 1.6h7.2a1.6 1.6 0 001.6-1.6v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" fill="none" aria-hidden>
      <circle cx="3.5" cy="3.5" r="3.125" fill="currentColor" />
    </svg>
  );
}

function CarouselArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="19.2" stroke="currentColor" strokeWidth="1.1" />
      <path
        d={direction === "left" ? "M23 13l-7 7 7 7" : "M17 13l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── The meta row under the hero — Frame 708 (847:239) ──
   Three label/value pairs. A pair with no value is left out rather than
   printed as an empty column with a heading over nothing. */
function MetaPair({ label, value, href }: { label: string; value: string; href?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-[7px]">
      <p className={EYEBROW}>{label}</p>
      {href ? (
        <Link href={href} className={`${BODY_16} text-[#F0F0F0] hover:text-[#32C6CC] transition-colors`}>
          {value}
        </Link>
      ) : (
        <p className={`${BODY_16} text-[#F0F0F0]`}>{value}</p>
      )}
    </div>
  );
}

/* A rule drawn as a shadow on a zero-height element, the way the frame draws
   it — a 1px block would add itself to every stack it sits in. */
function Rule({ className = "" }: { className?: string }) {
  return (
    <div className={`h-0 w-full ${className}`} style={{ boxShadow: "0 -1px 0 0 rgba(240,240,240,0.1)" }} />
  );
}

export default function CourseContent({
  program,
  relatedPrograms,
}: {
  program: AcademyProgram;
  relatedPrograms: AcademyProgram[];
}) {
  const href = useLocaleHref();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const typeLabel = program.type.charAt(0).toUpperCase() + program.type.slice(1);
  const instructorHref = href(`/academy/instructor/${slugifyName(program.whoLeads)}`);
  const learnHref = href(`/course/${program.slug}/learn`);

  const priceLabel = program.isFree
    ? "Free"
    : program.price != null
      ? `${program.currency === "EUR" ? "€" : `${program.currency} `}${program.price}`
      : "";
  const priceNote = program.isFree ? "No costs, no strings" : "One-time payment";

  const quotes = program.testimonials;
  const quote = quotes[quoteIndex % Math.max(quotes.length, 1)];

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* ── Hero band — Frame 108 (710:2046): full bleed, 128 → 778 ── */}
      <div className="relative" style={{ height: 650, marginTop: 0 }}>
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.thumbnailUrl}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(1) brightness(0.34)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.92) 78%, #0D0D0D 100%)" }}
          />
        </div>

        <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 h-full">
          {/* Back — Frame 93 (710:2069) sits at y=188, 60 under the navbar. */}
          <Link
            href={href("/academy")}
            className={`flex w-fit items-center gap-[7px] pt-[60px] leading-[16px] ${BTN_13} text-[#F0F0F0] hover:text-[#9D9C9C] transition-colors`}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
              <path d="M11 4H1M1 4L4 1M1 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          {/* Hero text — Frame 479 (710:2116): starts at y=408, gap 30, pb 50 */}
          <div className="flex flex-col gap-[30px] items-start pt-[204px] pb-[50px] max-w-[691px]">
            <div className="flex flex-col gap-[20px] items-start w-full">
              <div className="flex gap-[6px] items-center">
                <span className="text-[15px] leading-[18px] text-[#32C6CC]">{typeLabel}</span>
                {program.year && (
                  <span className="text-[12px] font-medium text-[#595C5C]">{program.year}</span>
                )}
              </div>
              <h1 className="text-[38px] font-semibold leading-[40px] tracking-[-0.57px] text-[#F0F0F0]">
                {program.title}
              </h1>
            </div>
            <p className={`${BODY_16} text-[#9D9C9C] max-w-[643px]`}>{program.description}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
        {/* ── Meta row — Frame 708 (847:239): y=654, w 995 ── */}
        <div className="flex flex-wrap gap-x-[80px] gap-y-[24px] pb-[30px] max-w-[995px]">
          <MetaPair label="Led by" value={program.whoLeads} href={instructorHref} />
          <MetaPair label="Duration" value={program.duration} />
          <MetaPair
            label={program.certification.label || "Certification"}
            value={program.certification.value}
          />
        </div>

        <Rule />

        {/* ── Body: 699px text column, price card floated right at 822 ── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-[123px]">
          <div className="flex-1 lg:max-w-[699px] w-full">
            {/* Who it's for — 710:2073, heading at y=839 (pt 100 from the rule) */}
            {program.whoItsFor && (
              <div className="pt-[100px]">
                <p className={`${EYEBROW} pb-[14px]`}>Who it&apos;s for</p>
                <p className={`${BODY_16} text-[#9D9C9C]`}>{program.whoItsFor}</p>
              </div>
            )}

            {/* "Free by principle" callout — Container 849:603, y=1033 */}
            {program.scholarshipNote && (
              <div
                className="mt-[60px] rounded-[6px] px-[41px] py-[36px]"
                style={{
                  background: "rgba(19,19,19,0.6)",
                  border: "1.5px solid rgba(240,240,240,0.1)",
                  backdropFilter: "blur(3px)",
                }}
              >
                <p className="text-[16px] font-medium leading-[24px] text-[#32C6CC] pb-[10px]">
                  {program.isFree ? "Free by principle" : "Scholarships"}
                </p>
                <p className={`${BODY_14} text-[#595C5C]`}>{program.scholarshipNote}</p>
              </div>
            )}

            {/* What are we going to talk about — 710:2078, y=1220 */}
            {program.howToJoin && (
              <div className="pt-[60px]">
                <p className={`${EYEBROW} pb-[14px]`}>What are we going to talk about</p>
                <p className={`${BODY_16} text-[#9D9C9C]`}>{program.howToJoin}</p>
              </div>
            )}

            <div className="pt-[60px]">
              <Rule />
            </div>

            {/* ── What you'll learn — Frame 740 (849:717), y=1450 ──
                Row pitch 44px: 24 of content, 20 of gap. */}
            <div className="pt-[60px]">
              <p className={`${EYEBROW} pb-[20px]`}>What you&apos;ll learn</p>
              {program.lessons.length === 0 ? (
                <p className={`${BODY_14} text-[#595C5C]`}>The curriculum for this programme is being written.</p>
              ) : (
                <div className="flex flex-col gap-[20px]">
                  {program.lessons.map((l, i) => (
                    <div key={i} className="flex items-start justify-between gap-[24px]">
                      <div className="flex items-start min-w-0">
                        <span
                          className="shrink-0 pr-[30px] text-[11px] leading-[24px] tracking-[1.76px] uppercase"
                          style={{ color: l.locked ? "#363636" : "#32C6CC" }}
                        >
                          {String(i).padStart(2, "0")}
                        </span>
                        <p className={BODY_16} style={{ color: l.locked ? "#363636" : "#F0F0F0" }}>
                          {l.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-[15px] shrink-0 text-[#595C5C]">
                        {l.videoUrl && !l.locked && <PlayIcon />}
                        {l.duration && !l.locked && <ClockIcon />}
                        {l.locked ? <LockIcon /> : <CheckCircleIcon />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Course Resources — Frame 742 (849:867), y=1838 ── */}
            <div className="pt-[60px]">
              <p className={`${EYEBROW} pb-[20px]`}>Course Resources</p>
              {program.resources.length === 0 ? (
                <p className={`${BODY_14} text-[#595C5C]`}>No resources have been attached yet.</p>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  {program.resources.map((file) => {
                    const meta = file.sizeLabel
                      ? `${file.type.toUpperCase()} · ${file.sizeLabel}`
                      : file.type.toUpperCase();
                    const inner = (
                      <>
                        <span className="flex gap-[12px] items-center min-w-0">
                          <span
                            className="px-[8px] py-[2px] rounded-[3px] text-[10px] font-bold leading-[15px] tracking-[0.1172px] shrink-0"
                            style={
                              file.locked
                                ? { background: "#363636", color: "#595C5C" }
                                : { background: "rgba(50,198,204,0.2)", color: "#32C6CC" }
                            }
                          >
                            {file.type.toUpperCase()}
                          </span>
                          <span className={`${BODY_14} truncate`} style={{ color: file.locked ? "#363636" : "#595C5C" }}>
                            {file.title}
                          </span>
                        </span>
                        <span className="flex gap-[12px] items-center shrink-0 text-[#363636]">
                          <span className="text-[12px] leading-[18px]">{meta}</span>
                          {file.locked ? <LockIcon /> : <DownloadIcon />}
                        </span>
                      </>
                    );
                    const cls =
                      "flex items-center justify-between gap-[20px] px-[20px] py-[14px] rounded-[6px] transition-colors hover:bg-[rgba(27,27,27,0.7)]";
                    const st = { background: "rgba(27,27,27,0.4)" };
                    /* Three states, and only one of them is a link:
                       locked   → the enrolment card, not an empty tab
                       no URL   → inert; seed data ships "#", and rendering
                                  that as a link opens a blank tab
                       ready    → the file itself */
                    const usable = file.url && file.url !== "#";
                    if (file.locked) {
                      return (
                        <a key={file.id} href="#enroll" className={cls} style={st}>
                          {inner}
                        </a>
                      );
                    }
                    if (!usable) {
                      return (
                        <div key={file.id} className={cls} style={st}>
                          {inner}
                        </div>
                      );
                    }
                    return (
                      <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className={cls} style={st}>
                        {inner}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Testimonials — Frame 741 (849:958), y=2135 ── */}
            {quotes.length > 0 && quote && (
              <>
                <div className="pt-[60px]">
                  <Rule />
                </div>
                <div className="pt-[60px]">
                  <p className={`${EYEBROW} pb-[20px]`}>Testimonials</p>
                  <div className="flex items-center gap-[20px]">
                    {quotes.length > 1 && (
                      <button
                        type="button"
                        aria-label="Previous testimonial"
                        onClick={() => setQuoteIndex((i) => (i - 1 + quotes.length) % quotes.length)}
                        className="shrink-0 text-[#363636] hover:text-[#595C5C] transition-colors"
                      >
                        <CarouselArrow direction="left" />
                      </button>
                    )}
                    <blockquote className="flex-1 min-w-0 px-[30px]">
                      <p className={`${BODY_16} text-[#9D9C9C] italic`}>&ldquo;{quote.quote}&rdquo;</p>
                      <p className={`${BODY_16} text-[#F0F0F0] mt-[10px]`}>{quote.author}</p>
                    </blockquote>
                    {quotes.length > 1 && (
                      <button
                        type="button"
                        aria-label="Next testimonial"
                        onClick={() => setQuoteIndex((i) => (i + 1) % quotes.length)}
                        className="shrink-0 text-[#363636] hover:text-[#595C5C] transition-colors"
                      >
                        <CarouselArrow direction="right" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Course partnerships — 849:1028, y=2479 ── */}
            {program.partnerships.length > 0 && (
              <>
                <div className="pt-[60px]">
                  <Rule />
                </div>
                <div className="pt-[60px]">
                  <p className={`${EYEBROW} pb-[20px]`}>Course partnerships</p>
                  <div className="flex flex-col gap-[40px]">
                    {program.partnerships.map((x, i) => (
                      <div key={i}>
                        {x.label && <p className={`${EYEBROW} pb-[3px]`}>{x.label}</p>}
                        {x.title && (
                          <p className={`${BODY_16} text-[#F0F0F0] pb-[7px]`}>{x.title}</p>
                        )}
                        <p className={`${BODY_16} text-[#595C5C]`}>{x.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Price card — Frame 719 (847:316): 402×460 at x=1170 ──
              Sticky so it stays with the reader down a 5993px page. */}
          <aside id="enroll" className="w-full lg:w-[402px] shrink-0 lg:sticky lg:top-[150px] pt-[100px]">
            <div
              className="flex items-center rounded-[6px] px-[40px] py-[35px]"
              style={{
                background: "rgba(19,19,19,0.6)",
                border: "1.5px solid rgba(240,240,240,0.1)",
                boxShadow: "0px 6px 20px 0px rgba(0,0,0,0.3)",
                backdropFilter: "blur(3px)",
              }}
            >
              <div className="flex flex-col items-start w-full lg:w-[325px]">
                <div className="flex flex-col gap-[15px] items-start pb-[40px] w-full">
                  <div className="flex flex-col items-end w-full">
                    <div className="flex flex-col items-start pb-[30px] w-full">
                      <p className="text-[26px] font-semibold leading-[26px] tracking-[-0.75px] text-white pb-[4px]">
                        {priceLabel}
                      </p>
                      <p className={`${BODY_16} text-[#595C5C] pb-[20px]`}>{priceNote}</p>
                      <Rule />
                    </div>

                    <div className="w-full">
                      <div className="flex flex-col pb-[40px] w-full">
                        <div className="flex items-center justify-between pb-[10px]">
                          <span className={`${BODY_14} text-[#595C5C]`}>Format</span>
                          <span className={`${BODY_14} text-[#F0F0F0]`}>
                            {FORMAT_LABELS[program.format] ?? program.format}
                          </span>
                        </div>
                        {program.duration && (
                          <div className="flex items-center justify-between pb-[10px]">
                            <span className={`${BODY_14} text-[#666]`}>Duration</span>
                            <span className={`${BODY_14} text-[#F0F0F0]`}>{program.duration}</span>
                          </div>
                        )}
                        {program.completionRate > 0 && (
                          <div className="flex items-center justify-between">
                            <span className={`${BODY_14} text-[#666]`}>Completion rate</span>
                            <span className={`${BODY_14} text-[#F0F0F0]`}>{program.completionRate}%</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={learnHref}
                        className={`flex gap-[7px] h-[44px] items-center justify-center p-[14px] rounded-[3px] w-full ${BTN_13} text-[#F0F0F0] transition-opacity hover:opacity-90`}
                        style={{
                          border: "1px solid rgba(240,240,240,0.2)",
                          backgroundImage:
                            "linear-gradient(93.3672deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
                        }}
                      >
                        {program.isFree ? "Enroll Now" : "Enroll Now"}
                        <ArrowRight />
                      </Link>
                    </div>
                  </div>

                  {program.dates && (
                    <p className="text-[12px] leading-[18px] text-[#363636] text-center w-full">
                      {program.dates}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Rule />
                  <div className="flex gap-[10px] items-center pt-[20px]">
                    <span
                      className="flex items-center justify-center rounded-full size-[24px] shrink-0"
                      style={{ background: "rgba(50,198,204,0.2)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                        <path d="M2 5.6l2.4 2.4L9 3.2" stroke="#32C6CC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <p className={`${BODY_14} text-[#595C5C]`}>Hosted by DSH Academy</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Share row — Frame 484 (710:2315), y=3036 ── */}
        <div className="flex flex-wrap items-center justify-between gap-[20px] pt-[200px] pb-[80px]">
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
              }
            }}
            className={`flex items-center gap-[6px] px-[16px] py-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
            style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
          >
            Share this course
            <ShareIcon />
          </button>
          <Link
            href={href("/support")}
            className={`${BODY_16} text-[#595C5C] hover:text-[#9D9C9C] transition-colors`}
          >
            Want to be part of our Academy? Get in touch
          </Link>
        </div>
      </div>

      {/* ── Support band — Frame 483 (710:2324), y=3316, full bleed ── */}
      <SupportCTA />

      {/* ── other suggestions — 849:1127 / cards 849:1062, y=4241 ── */}
      {relatedPrograms.length > 0 && (
        <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[160px]">
          <p className={`${EYEBROW} pb-[40px]`}>other suggestions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {relatedPrograms.map((rp) => (
              <div key={rp.slug} className="flex flex-col">
                <Link href={href(`/course/${rp.slug}`)} className="block group">
                  <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: "392 / 250" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rp.thumbnailUrl}
                      alt={rp.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ filter: "grayscale(1) brightness(0.8)" }}
                    />
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-[14px] pt-[40px]">
                  <span
                    className="flex items-center justify-center px-[8px] py-[5px] rounded-[3px] text-[12px] leading-[15px] font-medium text-[#F0F0F0]"
                    style={{ background: "rgba(50,198,204,0.7)" }}
                  >
                    {rp.type.charAt(0).toUpperCase() + rp.type.slice(1)}
                  </span>
                  {rp.duration && <span className={`${BODY_14} text-[#32C6CC]`}>{rp.duration}</span>}
                  {rp.isFree && (
                    <span className="text-[12px] leading-[15px] font-medium text-[#595C5C]">
                      Scholarship available
                    </span>
                  )}
                </div>

                <Link href={href(`/course/${rp.slug}`)} className="block pt-[20px] group">
                  <h3 className="text-[26px] font-semibold leading-[28px] tracking-[-0.75px] text-[#F0F0F0] group-hover:text-white transition-colors">
                    {rp.title}
                  </h3>
                </Link>
                <p className={`${BODY_14} text-[#595C5C] pt-[10px] line-clamp-2`}>{rp.description}</p>
                {rp.whoLeads && (
                  <p className={`${BODY_14} text-[#595C5C] pt-[20px]`}>by {rp.whoLeads}</p>
                )}

                <div className="flex items-center gap-[24px] pt-[20px]">
                  <Link
                    href={href(`/course/${rp.slug}/learn`)}
                    className={`flex items-center gap-[8px] px-[14px] py-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
                    style={{ background: "rgba(27,27,27,0.4)", border: "1px solid rgba(240,240,240,0.2)" }}
                  >
                    Enroll now
                    <ArrowRight size={6} />
                  </Link>
                  <Link
                    href={href(`/course/${rp.slug}`)}
                    className={`${BTN_13} text-[#595C5C] hover:text-[#9D9C9C] transition-colors`}
                  >
                    Know more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-[160px]">
        <Newsletter />
      </div>
      <Footer />
    </main>
  );
}
