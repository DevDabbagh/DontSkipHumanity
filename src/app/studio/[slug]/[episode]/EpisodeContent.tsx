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

const GLASS_BTN =
  "backdrop-blur-[3px] bg-[rgba(27,27,27,0.2)] border border-[rgba(240,240,240,0.2)] rounded-[3px] " +
  "inline-flex items-center justify-center gap-[7px] px-[14px] py-[12px] text-[13px] font-medium " +
  "text-[rgba(240,240,240,0.4)] hover:text-[rgba(240,240,240,0.6)] " +
  "hover:border-[rgba(240,240,240,0.3)] transition-colors";

const CARD_BORDER = "border-[1.5px] border-[rgba(240,240,240,0.1)] rounded-[6px]";
const CARD_SHADOW = "0px 6px 20px 0px rgba(0,0,0,0.5)";

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

/* Small dot glyph on the Download / Share buttons — Figma Group 374, 6.25px */
function DotGlyph() {
  return (
    <span
      aria-hidden
      className="shrink-0 rounded-full bg-current"
      style={{ width: 6.25, height: 6.25 }}
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
      <div className="flex flex-col lg:flex-row lg:items-end gap-[40px] xl:gap-[324px] w-full">
        {note && (
          <p className="font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px] text-[#363636] lg:w-[578px] whitespace-pre-line">
            {note}
          </p>
        )}
        <div className="flex flex-wrap gap-[24px] items-center">
          <button type="button" onClick={onDownload} className={GLASS_BTN}>
            Download {label}
            <DotGlyph />
          </button>
          <button type="button" onClick={onShare} className={GLASS_BTN}>
            {shareLabel}
            <DotGlyph />
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

          <div className="relative flex items-center justify-center gap-[30px] px-5">
            {/* Side previews — decorative, hidden below xl where they'd crowd */}
            {gallery.length > 1 && (
              <div
                className={`hidden xl:block relative shrink-0 w-[529px] h-[397px] overflow-hidden ${CARD_BORDER}`}
                style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
                aria-hidden
              >
                <img
                  src={gallery[(galleryIndex - 1 + gallery.length) % gallery.length]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-30"
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

                  <div className="flex items-center gap-[8px]" role="tablist" aria-label="Gallery">
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        role="tab"
                        aria-selected={i === galleryIndex}
                        aria-label={`Image ${i + 1}`}
                        onClick={() => setGalleryIndex(i)}
                        className="h-[6px] rounded-full transition-all duration-300"
                        style={{
                          width: i === galleryIndex ? 24 : 6,
                          backgroundColor:
                            i === galleryIndex ? "#B23495" : "rgba(240,240,240,0.2)",
                        }}
                      />
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
              <div
                className={`hidden xl:block relative shrink-0 w-[529px] h-[397px] overflow-hidden ${CARD_BORDER}`}
                style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
                aria-hidden
              >
                <img
                  src={gallery[(galleryIndex + 1) % gallery.length]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-30"
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
            {suggestions.map((s) => (
              <Link
                key={s.slug}
                href={`/studio/${s.slug}`}
                className="group flex flex-col sm:flex-row gap-[40px] items-start"
              >
                <div
                  className={`relative shrink-0 w-full sm:w-[221px] h-[288px] overflow-hidden ${CARD_BORDER}`}
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
                </div>
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
              </Link>
            ))}
          </div>
        </section>
      )}

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
