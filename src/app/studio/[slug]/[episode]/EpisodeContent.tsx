"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import type { StudioProject } from "@/lib/types";
import { useScrollColorize } from "@/hooks/useScrollColorize";
import EpisodeLightbox from "@/components/EpisodeLightbox";

/* ═══════════════════════════════════════════════════════════════
   DSH – Studio – episode details
   Built from Figma node 714:3643 (1920×6597, 1224 container at x=348).

   Section map (y on the 1920 frame):
     128   Frame 108   hero band (h 650) — contains the episode card 714:4094
     128   Frame 93    back link
     204   Frame 595   YALLA · Videocast
     914   Frame 628   pull quote
    1038   Frame 629   glossary block (heading + 2 rows + note/buttons + rule)
    2262   Frame 630   pull quote
    2476   Frame 612   guest recommendations heading
    3440   Frame 622   recommendations note/buttons + rule
    3700   Frame 631   pull quote
    3902   Frame 632   episode gallery heading
    4066   Frame 646   gallery carousel (800×600 + side previews)
    4746   Frame 640   other suggestions
    5538   Group 382   newsletter
    6139   Frame 423   footer

   Every data-driven section renders ONLY when its data exists — the frame
   carries placeholder copy ("Lorem ipsum cool sentence", and recommendation
   cards duplicated from the glossary) which must never reach the site.
   ═══════════════════════════════════════════════════════════════ */

type Episode = StudioProject["episodes"][number];
type GlossaryEntry = NonNullable<Episode["glossary"]>[number];

const EYEBROW =
  "text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#363636]";
const BODY =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";

/**
 * Glass button.
 *
 * `leading-[16px]` is load-bearing: every one of these is 40px tall in the
 * frame (Frame 4 / Frame 5 / Frame 617 — text at y12, 16px line box). Without
 * an explicit line-height, 13px text resolves to a ~22px line box and every
 * button came out 46px — 6px too tall, which then pushed the suggestion card
 * to 374px against the frame's 368px.
 *
 * py is 11, not 12, because the 1px border counts: 11 + 16 + 11 + 2 = 40.
 * Figma draws the stroke inside the frame bounds, so its 40 is the outer
 * height, not the content box.
 */
const GLASS_BTN =
  "backdrop-blur-[3px] bg-[rgba(27,27,27,0.2)] border border-[rgba(240,240,240,0.2)] rounded-[3px] " +
  "inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] text-[13px] leading-[16px] font-medium " +
  "text-[rgba(240,240,240,0.4)] hover:text-[rgba(240,240,240,0.6)] " +
  "hover:border-[rgba(240,240,240,0.3)] transition-colors";

const CARD_BORDER = "border-[1.5px] border-[rgba(240,240,240,0.1)] rounded-[6px]";
/**
 * Spread is 2, not 0.
 *
 * Figma's generated CSS writes this shadow as `0px 6px 20px 0px`, but the
 * effect list on both nodes that use it — the glossary card frame (715:148)
 * and the gallery box (714:3814) — reads
 * `DROP_SHADOW #00000080, offset (0,6), radius 20, spread 2`. The generated
 * class drops the spread; the effect list is the truth. `StudioListing`
 * already carries both a spread-0 and a spread-2 variant, so the design does
 * use both — this file's nodes are the spread-2 kind.
 */
const CARD_SHADOW = "0px 6px 20px 2px rgba(0,0,0,0.5)";

const FORMAT_LABELS: Record<string, string> = {
  docuseries: "Docuseries",
  videocast: "Videocast",
  podcast: "Podcast",
  series: "Series",
  other: "Other media",
};

/* Play-arrow glyph — Figma Vector 10 (5.859 × 8.187) */
function PlayArrow() {
  return (
    <svg
      width="5.859"
      height="8.187"
      viewBox="0 0 6 9"
      fill="currentColor"
      className="shrink-0 text-[#B23495]"
      aria-hidden
    >
      <path d="M0.5 0.5L5.5 4.5L0.5 8.5V0.5Z" />
    </svg>
  );
}

/**
 * 45° arrow on the Download / Share buttons — the `ic_icon_arrow_45.svg`
 * asset Ahmed supplied, replacing the dot that stood in for it.
 * Rendered from the file rather than redrawn so it stays the exported artwork
 * (8×8, stroke #595C5C).
 */
function ArrowGlyph() {
  return (
    <img
      src="/images/ic_icon_arrow_45.svg"
      alt=""
      aria-hidden
      className="shrink-0 w-[8px] h-[8px]"
    />
  );
}

/* ── Pull quote — Figma 715:392 / 721:399 / 721:403 ──
   Grape 2px left rule, 30px inset, italic Source Sans 3 18/24. */
function PullQuote({ text }: { text: string }) {
  return (
    <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
      <div className="pb-[100px] lg:pl-[70px]">
        <blockquote className="border-l-2 border-[#8665A7] pl-[30px] lg:w-[730px]">
          <p className="font-[family-name:var(--font-source-sans)] italic font-medium text-[18px] leading-[24px] tracking-[-0.08px] text-[#9D9C9C]">
            {text}
          </p>
        </blockquote>
      </div>
    </section>
  );
}

/* ── Glossary / recommendation entry — Figma 715:214 ──
   221×288 still, 40px gap, 318px text column. */
function EntryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <div className="flex flex-col sm:flex-row gap-[40px] items-start">
      {entry.imageUrl && (
        <div
          className={`relative shrink-0 w-full sm:w-[221px] h-[288px] overflow-hidden ${CARD_BORDER}`}
          style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
        >
          <img
            data-colorize
            src={entry.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-50"
          />
        </div>
      )}
      <div className="flex flex-col gap-[50px] items-start w-full sm:w-[318px]">
        <div className="flex flex-col gap-[30px] items-start w-full">
          <h3 className="font-semibold text-[22px] leading-[22px] tracking-[-0.4px] text-[#8665A7] w-full">
            {entry.term}
          </h3>
          <p className={`${BODY} w-full`}>{entry.definition}</p>
        </div>
        {entry.source && (
          <p className="flex gap-[5px] items-start text-[12px] leading-[16px] tracking-[-0.06px]">
            <span className="text-[#595C5C] shrink-0">Source:</span>
            <span className="text-[#363636]">{entry.source}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Note + Download/Share + rule — Figma 715:365 / 715:381 ── */
function EntryFooter({
  note,
  label,
  onDownload,
  onShare,
  shareLabel,
}: {
  note?: string;
  label: string;
  onDownload: () => void;
  onShare: () => void;
  shareLabel: string;
}) {
  return (
    <div className="flex flex-col gap-[30px] items-start pb-[130px]">
      {/* justify-between, not a fixed gap.
          The frame right-aligns this button pair to the 1224 container — the
          glossary pair starts at x902 (318.5 wide) and the recommendations
          pair at x787 (436.5 wide), both ending flush at 1224. Hard-coding
          `xl:gap-[324px]` matched only the glossary case and left the wider
          pair 118px short of the room it needed, so it wrapped and the two
          buttons stacked. Right-aligning holds for any label length. */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-[40px] w-full">
        {note && (
          <p className="font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px] text-[#363636] lg:w-[578px] whitespace-pre-line">
            {note}
          </p>
        )}
        {/* flex-nowrap: side by side as in Frame 618, never stacked. */}
        <div className="flex flex-nowrap gap-[24px] items-center shrink-0">
          <button type="button" onClick={onDownload} className={GLASS_BTN}>
            Download Documentation
            <ArrowGlyph />
          </button>
          <button type="button" onClick={onShare} className={GLASS_BTN}>
            Share Documentation
            <ArrowGlyph />
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-[rgba(240,240,240,0.1)]" />
    </div>
  );
}

/* ── Section heading — Figma 715:77 ── */
function SectionHeading({ eyebrow, title }: { eyebrow: string; title?: string }) {
  return (
    <div className="flex flex-col gap-[14px] items-start pb-[100px]">
      <p className={EYEBROW}>{eyebrow}</p>
      {title && (
        <h2 className="font-semibold text-[26px] leading-[26px] tracking-[-0.75px] text-white">
          {title}
        </h2>
      )}
    </div>
  );
}

export default function EpisodeContent({
  project,
  episode,
  suggestions,
}: {
  project: StudioProject;
  episode: Episode;
  suggestions: StudioProject[];
}) {
  const colorizeRef = useScrollColorize<HTMLElement>();

  const heroImage = episode.imageUrl || project.coverUrl || project.thumbnailUrl;
  const formatLabel = FORMAT_LABELS[project.format] ?? project.format;
  const quotes = episode.quotes ?? [];

  const gallery = useMemo(
    () => (episode.gallery ?? []).filter(Boolean),
    [episode.gallery]
  );
  const [galleryIndex, setGalleryIndex] = useState(0);

  /* Watch lightbox. It opens on this episode but carries the whole run, so
     the drawer can move between episodes without leaving the page. */
  const [watchOpen, setWatchOpen] = useState(false);
  const watchIndex = Math.max(
    project.episodes.findIndex((e) => e.slug === episode.slug),
    0
  );
  const listenLink = project.listenLinks.filter((l) => l.url && l.url !== "#")[0]?.url;

  /* Share copies the page URL; the Web Share sheet is used when offered. */
  const share = async (title: string) => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed, or clipboard denied — stay silent */
    }
  };

  /* Download builds a plain-text file from the entries in the browser —
     no server round-trip and no asset that has to exist up front. */
  const download = (entries: GlossaryEntry[], heading: string, file: string) => {
    if (typeof window === "undefined") return;
    const lines = [
      `${heading} — ${project.title}`,
      episode.title,
      "",
      ...entries.flatMap((e) => [
        e.term,
        e.definition,
        e.source ? `Source: ${e.source}` : "",
        "",
      ]),
      `${window.location.origin}`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* `overflow-x-clip`, not `-hidden`: hidden forces overflow-y to auto and
     turns <main> into a scroll container, which breaks sticky/scroll effects. */
  return (
    <main
      ref={colorizeRef}
      className="min-h-screen bg-[#0D0D0D] text-white overflow-x-clip"
    >
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Frame 108 (714:3644). Base + photo at
          mix-blend-luminosity 30% + the two-gradient stack from the frame.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[650px] overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-30"
            style={{ objectPosition: "50% 35%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(13,13,13,0) 0%, rgb(13,13,13) 100%), " +
                "linear-gradient(108.771319885494deg, rgba(13,13,13,0.2) 2.3431%, rgba(134,101,167,0.2) 99.409%)",
            }}
          />
        </div>

        <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          {/* Back link — Frame 93 */}
          <div className="pt-[60px]">
            <Link
              href={`/studio/${project.slug}`}
              className="inline-flex items-center gap-[7px] text-[13px] font-medium text-[#595C5C] hover:text-[#8B8F8F] transition-colors"
            >
              <span aria-hidden className="rotate-180 inline-flex">
                <PlayArrow />
              </span>
              Back
            </Link>
          </div>

          {/* YALLA · Videocast — Frame 595: gap 14, items-end, pt 100 pb 50 */}
          <div className="flex gap-[14px] items-end pt-[100px] pb-[50px]">
            <p className="font-semibold text-[26px] leading-[26px] tracking-[-0.75px] text-[#F0F0F0]">
              {project.title}
            </p>
            <p className="text-[15px] leading-[18px] text-[#8665A7]">{formatLabel}</p>
          </div>

          {/* Episode card — Frame 714:4093: gap 60, items-start */}
          <div className="flex flex-col lg:flex-row gap-[60px] items-start pb-[100px]">
            {/* Left — still 405×267 + guest, gap 26 */}
            <div className="flex flex-col gap-[26px] items-start shrink-0">
              <div
                className={`relative w-full lg:w-[405px] h-[267px] overflow-hidden ${CARD_BORDER}`}
                style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
              >
                <img
                  data-colorize
                  src={heroImage}
                  alt={episode.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-[6px] opacity-80"
                />
              </div>
              {episode.guest && (
                <p className="flex gap-[7px] items-end">
                  <span className="text-[12px] font-medium text-[#363636]">Guest</span>
                  <span className="text-[14px] font-semibold text-[#8665A7]">
                    {episode.guest}
                  </span>
                </p>
              )}
            </div>

            {/* Right — meta, title, subtitle, description, CTA */}
            <div className="flex flex-col gap-[40px] items-start w-full lg:w-[756px]">
              <div className="flex flex-col gap-[40px] items-start w-full">
                <div className="flex flex-col gap-[10px] items-start w-full">
                  {/* Chip row — gap 18, pb 30 */}
                  <div className="flex flex-wrap gap-[18px] items-center pb-[30px]">
                    {episode.number != null && (
                      <span className="bg-[#8665A7] rounded-[3px] px-[10px] py-[8px] text-[14px] font-semibold text-[#F0F0F0]">
                        Episode {episode.number}
                      </span>
                    )}
                    <span className="flex gap-[10px] items-center text-[12px] font-medium">
                      {episode.season != null && (
                        <span className="text-[#8665A7]">Season {episode.season}</span>
                      )}
                      {(episode.year || project.credits.year) && (
                        <span className="text-[#595C5C]">
                          {episode.year || project.credits.year}
                        </span>
                      )}
                    </span>
                  </div>

                  <h1 className="font-semibold text-[30px] leading-[33px] tracking-[-0.75px] text-[#F0F0F0] w-full">
                    {episode.title}
                  </h1>
                  {episode.subtitle && (
                    <p className="font-semibold text-[22px] leading-[22px] tracking-[-0.4px] text-[#F0F0F0] w-full">
                      {episode.subtitle}
                    </p>
                  )}
                </div>

                {episode.description && (
                  <p className={`${BODY} w-full`}>{episode.description}</p>
                )}
              </div>

              {/* "View episode" — Figma 714:3756. Watching happens on the
                  platform now, so this opens the player lightbox whenever the
                  episode has a video. The external listen link is only the
                  fallback for episodes that have no file yet; with neither,
                  the button is omitted rather than rendered dead. */}
              {episode.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setWatchOpen(true)}
                  className={GLASS_BTN}
                >
                  View episode
                  <PlayArrow />
                </button>
              ) : (
                listenLink && (
                  <a
                    href={listenLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={GLASS_BTN}
                  >
                    View episode
                    <PlayArrow />
                  </a>
                )
              )}
            </div>
          </div>

          <div className="h-px w-full bg-[rgba(240,240,240,0.1)]" />
        </div>
      </section>

      {/* Pull quote 1 — Frame 628 */}
      {quotes[0] && (
        <div className="pt-[100px]">
          <PullQuote text={quotes[0]} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          GLOSSARY — Frame 629. Hidden entirely when there are no entries.
         ═══════════════════════════════════════════════════════════ */}
      {episode.glossary && episode.glossary.length > 0 && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          <SectionHeading
            eyebrow={`${project.title} Glossary`}
            title={episode.glossaryIntro}
          />
          <div className="flex flex-col gap-[104px] pb-[104px]">
            {Array.from(
              { length: Math.ceil(episode.glossary.length / 2) },
              (_, row) => (
                <div
                  key={row}
                  className="grid lg:grid-cols-2 gap-[66px] lg:gap-[66px] items-start"
                >
                  {episode.glossary!.slice(row * 2, row * 2 + 2).map((e) => (
                    <EntryCard key={e.term} entry={e} />
                  ))}
                </div>
              )
            )}
          </div>
          <EntryFooter
            note={episode.glossaryNote}
            label="glossary"
            shareLabel="Share glossary"
            onDownload={() =>
              download(
                episode.glossary!,
                "Glossary",
                `${project.slug}-glossary.txt`
              )
            }
            onShare={() => share(`${project.title} Glossary`)}
          />
        </section>
      )}

      {/* Pull quote 2 — Frame 630 */}
      {quotes[1] && <PullQuote text={quotes[1]} />}

      {/* ═══════════════════════════════════════════════════════════
          GUEST RECOMMENDATIONS — Frame 612/613/614/622.
          In the frame these cards duplicate the glossary content
          (designer placeholder), so this renders only from real data.
         ═══════════════════════════════════════════════════════════ */}
      {episode.recommendations && episode.recommendations.length > 0 && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          <SectionHeading
            eyebrow="Guest Recommendations"
            title={episode.recommendationsIntro}
          />
          <div className="flex flex-col gap-[104px] pb-[104px]">
            {Array.from(
              { length: Math.ceil(episode.recommendations.length / 2) },
              (_, row) => (
                <div
                  key={row}
                  className="grid lg:grid-cols-2 gap-[66px] items-start"
                >
                  {episode.recommendations!.slice(row * 2, row * 2 + 2).map((e) => (
                    <EntryCard key={e.term} entry={e} />
                  ))}
                </div>
              )
            )}
          </div>
          <EntryFooter
            note={episode.recommendationsNote}
            label="recommendations"
            shareLabel="Share recommendations"
            onDownload={() =>
              download(
                episode.recommendations!,
                "Recommendations",
                `${project.slug}-recommendations.txt`
              )
            }
            onShare={() => share(`${project.title} — recommendations`)}
          />
        </section>
      )}

      {/* Pull quote 3 — Frame 631 */}
      {quotes[2] && <PullQuote text={quotes[2]} />}

      {/* ═══════════════════════════════════════════════════════════
          EPISODE GALLERY — Frame 632 heading + Frame 646 carousel.
          Centre 800×600 at opacity 80; the two side previews sit at
          mix-blend-luminosity 30% (Figma 721:411 / 721:413).
         ═══════════════════════════════════════════════════════════ */}
      {gallery.length > 0 && (
        <section>
          <div className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
            <SectionHeading eyebrow="Episode gallery" title={episode.galleryIntro} />
          </div>

          {/* items-start, not items-center.
              Centring aligned the previews to the whole left column — image
              600 + gap 40 + controls 40 — so they sat 40px low. In the frame
              they centre on the IMAGE alone: preview y4167 vs image y4066,
              a 101px offset ((600−397)/2). */}
          <div className="relative flex items-start justify-center gap-[30px] px-5">
            {/* Side previews — decorative, hidden below xl where they'd crowd */}
            {/* The gradient below is a SIBLING of the bordered box, not a
                child. As a child it was clipped by `overflow-hidden` at the
                padding box, so the 1.5px stroke stayed at full strength while
                the picture faded — the border drew a bright rectangle across
                the dark end. In the frame the "shadow left" rect sits above
                the whole node, stroke included, so the outline fades too. */}
            {gallery.length > 1 && (
              <div className="hidden xl:block relative shrink-0 w-[529px] h-[397px] mt-[101px]" aria-hidden>
                <div
                  className={`relative w-full h-full overflow-hidden ${CARD_BORDER}`}
                  style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
                >
                  <img
                    src={gallery[(galleryIndex - 1 + gallery.length) % gallery.length]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-30"
                  />
                </div>
                {/* "shadow left" — Figma 721:434. Not a drop shadow: a
                    gradient panel laid over the preview, clear at the inner
                    edge and solid #0D0D0D at the outer one, so the preview
                    dissolves into the page instead of ending in a hard
                    rectangle. The same node exists on the studio details
                    frame (714:3645) but is hidden there.

                    460 × 500, starting 51px ABOVE the 397px preview — the
                    frame deliberately oversizes it so it also swallows the
                    drop shadow the preview casts above and below. Matching it
                    to the preview's own height left that halo on show. */}
                <span
                  className="absolute left-[-40px] top-[-51px] w-[500px] h-[500px] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(268.98deg, rgba(13,13,13,0) 0.87%, rgb(13,13,13) 59.73%)",
                  }}
                />
              </div>
            )}

            <div className="flex flex-col gap-[40px] w-full max-w-[800px] shrink-0">
              <div
                className={`relative w-full h-[420px] lg:h-[600px] overflow-hidden ${CARD_BORDER}`}
                style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
              >
                {gallery.map((src, i) => (
                  <img
                    key={src}
                    data-colorize
                    src={src}
                    alt={
                      gallery.length > 1
                        ? `${episode.title} — image ${i + 1} of ${gallery.length}`
                        : episode.title
                    }
                    aria-hidden={i !== galleryIndex}
                    className="absolute inset-0 w-full h-full object-cover rounded-[6px] transition-opacity duration-500"
                    style={{ opacity: i === galleryIndex ? 0.8 : 0 }}
                  />
                ))}
              </div>

              {/* Controls — Frame 645: px 40, space-between. Indicator in the
                  centre is an addition on top of the frame (Tiago's note). */}
              {gallery.length > 1 && (
                <div className="flex items-center justify-between px-[40px] w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    aria-label="Previous image"
                    className="w-[40px] h-[40px] rounded-full backdrop-blur-[2px] transition-opacity hover:opacity-80"
                  >
                    <img src="/images/ic_left_arrow.svg" alt="" className="w-full h-full" />
                  </button>

                  {/* Kept per Tiago's note even though 730:655 has only the
                      two arrows — but on the page's own terms: grape for the
                      active state like every other active element here, and
                      14px apart so five dots read as a row rather than a
                      smear. Hit area is padded out to 24px tall; a 6px dot is
                      below any sane touch target. */}
                  <div
                    className="flex items-center gap-[14px]"
                    role="tablist"
                    aria-label="Gallery"
                  >
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        role="tab"
                        aria-selected={i === galleryIndex}
                        aria-label={`Image ${i + 1}`}
                        onClick={() => setGalleryIndex(i)}
                        className="group h-[24px] flex items-center transition-all duration-300"
                      >
                        <span
                          className="block h-[6px] rounded-full transition-all duration-300 group-hover:opacity-80"
                          style={{
                            width: i === galleryIndex ? 24 : 6,
                            backgroundColor:
                              i === galleryIndex ? "#8665A7" : "rgba(240,240,240,0.2)",
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                    aria-label="Next image"
                    className="w-[40px] h-[40px] rounded-full backdrop-blur-[2px] transition-opacity hover:opacity-80"
                  >
                    <img src="/images/ic_right_arrow.svg" alt="" className="w-full h-full" />
                  </button>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="hidden xl:block relative shrink-0 w-[529px] h-[397px] mt-[101px]" aria-hidden>
                <div
                  className={`relative w-full h-full overflow-hidden ${CARD_BORDER}`}
                  style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
                >
                  <img
                    src={gallery[(galleryIndex + 1) % gallery.length]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-30"
                  />
                </div>
                {/* Mirror of 721:434 — solid at the right (outer) edge. */}
                <span
                  className="absolute right-[-40px] top-[-51px] w-[500px] h-[500px] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(88.98deg, rgba(13,13,13,0) 0.87%, rgb(13,13,13) 59.73%)",
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          OTHER SUGGESTIONS — Frame 640
         ═══════════════════════════════════════════════════════════ */}
      {suggestions.length > 0 && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[180px]">
          <p className={`${EYEBROW} pb-[64px]`}>other suggestions</p>
          <div className="grid lg:grid-cols-2 gap-[24px] pb-[180px]">
            {/* Card — Figma 726:477. The whole card used to be one <Link>,
                which meant the frame's own two controls (Frame 459: "View all
                episodes" + "Know more") could not exist — a link inside a link
                is invalid. It's a plain container now with those two controls
                rendered explicitly, as designed. */}
            {suggestions.map((s) => (
              <div key={s.slug} className="group flex flex-col sm:flex-row gap-[40px] items-start">
                {/* Left column — 221 wide: still 288, 40px gap, CTA row 40 */}
                <div className="shrink-0 w-full sm:w-[221px] flex flex-col gap-[40px]">
                  <Link
                    href={`/studio/${s.slug}`}
                    aria-label={s.title}
                    className={`relative block w-full h-[288px] overflow-hidden ${CARD_BORDER}`}
                    style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
                  >
                    {/* Guarded: a project with neither image would otherwise
                        render src="", which makes the browser re-request the
                        whole page. */}
                    {(s.thumbnailUrl || s.coverUrl) && (
                      <img
                        src={s.thumbnailUrl || s.coverUrl}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                      />
                    )}
                  </Link>

                  {/* Frame 459 — the button sits at 147.86 wide, "Know more"
                      beside it. Both point at the project; the frame shows
                      them as separate affordances, so they stay separate. */}
                  <div className="flex items-center gap-[24px] whitespace-nowrap">
                    {/* No padding override — GLASS_BTN already carries the
                        frame's 14/11, and re-stating py-12 here is what kept
                        this one button 2px taller than the rest. */}
                    <Link href={`/studio/${s.slug}`} className={GLASS_BTN}>
                      View all episodes
                      <PlayArrow />
                    </Link>
                    <Link
                      href={`/studio/${s.slug}`}
                      className="text-[13px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
                    >
                      Know more
                    </Link>
                  </div>
                </div>

                {/* Right column — 338 wide × 288 tall, with "Produced by"
                    pinned to the bottom (Frame 455 at y240 of a 288 column). */}
                <div className="flex flex-col justify-between gap-[40px] w-full sm:w-[338px] sm:h-[288px]">
                  <div className="flex flex-col gap-[14px] items-start">
                    <span className="flex flex-wrap gap-[10px] items-center">
                      <span className="bg-[#573377] rounded-[3px] px-[8px] py-[5px] text-[12px] font-medium text-[#F0F0F0]">
                        {FORMAT_LABELS[s.format] ?? s.format}
                      </span>
                      <span className="text-[15px] text-[#8665A7] capitalize">{s.status}</span>
                      <span className="text-[12px] font-medium text-[#595C5C]">
                        {s.credits.year}
                      </span>
                    </span>
                    <h3 className="font-semibold text-[24px] leading-[30px] text-[#F0F0F0]">
                      {s.title}
                    </h3>
                    <p className={BODY}>{s.oneLineDescription}</p>
                  </div>

                  {/* Frame 455 — hidden when the project has no producer
                      credit, rather than leaving a stranded label. */}
                  {s.credits.production && (
                    <div className="flex flex-col gap-[6px] items-start">
                      <p className="text-[14px] leading-[21px] text-[#363636]">Produced by</p>
                      <p className="text-[14px] leading-[21px] text-[#9D9C9C]">
                        {s.credits.production}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trailing space before the newsletter.
       *
       * The frame gives each section 180px of internal top and bottom space
       * and lets the boxes abut at 0 — so the gallery has no bottom padding
       * of its own; it borrows the 180px that "other suggestions" (Frame 640)
       * carries at its top. That works right up until the project has no
       * siblings and Frame 640 doesn't render, which is when the carousel
       * ends up flush against the newsletter's full-bleed band.
       *
       * Putting the 180px on the gallery instead would double it the moment a
       * second studio project exists (180 gallery + 180 suggestions = 360).
       * So the space is added here, once, only when the section that would
       * otherwise have provided it is missing — identical spacing in both
       * states, and it cannot stack.
       */}
      {suggestions.length === 0 && <div aria-hidden className="h-[180px]" />}

      <Newsletter />
      <Footer />

      {/* Watch lightbox — same component the studio details page uses, so
          "View episode" behaves identically wherever it appears. */}
      <EpisodeLightbox
        open={watchOpen}
        onClose={() => setWatchOpen(false)}
        projectTitle={project.title}
        episodes={project.episodes}
        initialIndex={watchIndex}
      />
    </main>
  );
}
