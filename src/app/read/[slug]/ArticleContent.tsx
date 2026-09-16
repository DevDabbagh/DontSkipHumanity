"use client";

import Link from "next/link";
import PaywalledBody from "./PaywalledBody";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocaleHref } from "@/contexts/LocaleContext";
import {
  BODY_16,
  BODY_14,
  BTN_13,
  Rule,
  ShareButton,
  formatDate,
  prettyTag,
  sectionColour,
} from "@/components/read/ArticleCard";
import type { Article, ArticleBlock } from "@/lib/types";

/**
 * Read — article details.
 *
 * Built to Figma frame `809:3299` ("DSH – Read details – FREE"), 1920×8275.
 *
 * Two widths, both centred on the 1920 canvas:
 *   header column  1000px  (x=460)   — back link, title block, author row
 *   reading column  800px  (x=560)   — meta, body, sources, resources
 * The 1224px container returns further down for related articles and the
 * footer, as on every other page.
 *
 * The paywall is not here. `page.tsx` cuts a subscription article to a short
 * preview before it reaches this file, and `<PaywalledBody>` fetches the rest
 * with the reader's token. This component only decides where the body goes.
 */

/* ── Type ramp, from the frame's named styles ────────────────────────── */
/* READ-Body-Medium: the article's own body style — 27px leading, not 24. */
const READ_16 =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[27px] tracking-[-0.08px]";
const TAG_15 = "text-[15px] leading-[18px] font-normal";

/* Frame 93 (809:3323): 12×8 arrow, 7px gap, "Back" in Inter Medium 13. */
function ArrowLeft() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
      <path d="M11 4H1M1 4L4 1M1 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Group 374 (883:754): the 6.25px "↗" that closes the share button. */
function ArrowUpRight() {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" fill="none" aria-hidden>
      <path d="M1 6L6 1M6 1H2M6 1V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The canonical bordered button (Team Brief §4b), as drawn on this frame:
   1px rgba(240,240,240,.2) · rgba(27,27,27,.2) · px16 py12 · r3 · 13px @40%. */
const GLASS_BTN =
  `flex items-center gap-[6px] px-[16px] py-[12px] rounded-[3px] ${BTN_13} leading-[16px] text-[rgba(240,240,240,0.4)] hover:text-[#F0F0F0] transition-colors backdrop-blur-[3px]`;
const GLASS_STYLE = { background: "rgba(27,27,27,0.2)", border: "1px solid rgba(240,240,240,0.2)" };

/* ── Body blocks ─────────────────────────────────────────────────────── */
function RenderBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "text":
      return <p className={`${READ_16} text-[#9D9C9C] pb-[40px]`}>{block.content}</p>;
    case "heading":
      return <p className={`${READ_16} text-[#F0F0F0] font-semibold pb-[40px]`}>{block.content}</p>;
    default:
      return null;
  }
}

export default function ArticleContent({
  article,
  relatedArticles,
}: {
  article: Article;
  relatedArticles: Article[];
}) {
  const href = useLocaleHref();
  const shareUrl = href(`/read/${article.slug}`);
  void relatedArticles;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F0F0F0]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO + HEADER — Frame 108 (809:3300) behind Frame 819 (883:767).
          The photo band is 650 tall and starts under the fixed 128px
          navbar; the header column sits on top of it and is 606 tall, so
          the rule under the author row lands 44px above the band's end.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-[128px]">
        {/* The band: photo at luminosity 20%, a fade to the page colour and
            a faint sky tint — Read's category colour. Texture, not content,
            so it is never colourised on scroll. */}
        <div aria-hidden className="absolute inset-x-0 top-[128px] h-[650px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          {article.mainImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.mainImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-20"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(13,13,13,0) 0%, #0D0D0D 100%), linear-gradient(108.77deg, rgba(13,13,13,0.2) 2.34%, rgba(93,148,185,0.2) 99.41%)",
            }}
          />
        </div>

        {/* Header column — 1000 wide, x=460 on the 1920 canvas */}
        <div className="relative max-w-[1000px] mx-auto px-5 sm:px-8 xl:px-0">
          <div className="max-w-[789px]">
            {/* Frame 93: pt 60 · pb 160 */}
            <div className="flex pt-[60px] pb-[160px]">
              <Link
                href={href("/read")}
                className={`inline-flex items-center gap-[7px] ${BTN_13} leading-[16px] text-[#595C5C] hover:text-[#9D9C9C] transition-colors`}
              >
                <ArrowLeft />
                Back
              </Link>
            </div>

            {/* Frame 479: tag → 20 → title → 30 → standfirst → pb 70 */}
            <div className="pb-[70px]">
              {article.tag && (
                <p className={`${TAG_15} text-[#5D94B9] pb-[20px]`}>{prettyTag(article.tag)}</p>
              )}
              <h1 className="text-[30px] leading-[34px] sm:text-[38px] sm:leading-[40px] font-semibold tracking-[-0.57px] text-[#F0F0F0]">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className={`${BODY_16} text-[#9D9C9C] pt-[30px]`}>{article.excerpt}</p>
              )}
            </div>
          </div>

          {/* Frame 817: author row (items-end) · pb 30 · rule */}
          <div className="flex items-end justify-between gap-6 pb-[30px]">
            {article.author?.name ? (
              <div className="flex items-center gap-[15px]">
                {article.author.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.author.avatar}
                    alt=""
                    className="w-[50px] h-[50px] rounded-full object-cover shrink-0"
                  />
                )}
                <div className="w-[210px]">
                  <p className={`${BODY_16} text-[#F0F0F0] pb-[3px]`}>{article.author.name}</p>
                  {article.author.bio && (
                    <p className={`${BODY_14} text-[#595C5C]`}>{article.author.bio}</p>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}
            <ShareButton url={shareUrl} label="Share this article" className={GLASS_BTN} />
          </div>
          <Rule />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          READING COLUMN — 800 wide, x=560. Frame 662 (883:724) is the
          meta row: pt 100 · chip · section · date · pb 70.
         ═══════════════════════════════════════════════════════════ */}
      <div className="relative max-w-[800px] mx-auto px-5 sm:px-8 xl:px-0">
        {(article.tag || article.section || article.date) && (
          <div className="flex flex-wrap items-center gap-[14px] pt-[100px] pb-[70px]">
            {article.tag && (
              <span className="flex items-center justify-center px-[8px] py-[5px] rounded-[3px] bg-[#5D94B9] text-[12px] leading-[15px] font-medium text-[#F0F0F0]">
                {prettyTag(article.tag)}
              </span>
            )}
            <span className="flex items-center gap-[10px] text-[12px] leading-[15px] font-medium">
              {article.section && (
                <span style={{ color: sectionColour(article.section) }}>{article.section}</span>
              )}
              {article.date && <span className="text-[#595C5C]">{formatDate(article.date)}</span>}
            </span>
          </div>
        )}

        {/* Body — free articles render what the page already carries;
            subscription articles arrive as a preview and ask the server. */}
        <article>
          <PaywalledBody
            slug={article.slug}
            access={article.access}
            initialBody={article.body}
            render={(blocks) => blocks.map((block) => <RenderBlock key={block.id} block={block} />)}
          />
        </article>
      </div>

      <Footer />
    </main>
  );
}
