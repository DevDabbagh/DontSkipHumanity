"use client";

import Link from "next/link";
import PaywalledBody from "./PaywalledBody";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleGallery from "@/components/read/ArticleGallery";
import { useLocaleHref } from "@/contexts/LocaleContext";
import { useScrollColorize } from "@/hooks/useScrollColorize";
import {
  EYEBROW,
  BODY_16,
  BODY_14,
  BTN_13,
  Rule,
  ShareButton,
  formatDate,
  prettyTag,
  sectionColour,
} from "@/components/read/ArticleCard";
import type { Article, ArticleBlock, ArticleResource, ArticleSource } from "@/lib/types";

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
  `flex items-center gap-[6px] px-[16px] py-[11px] rounded-[3px] ${BTN_13} leading-[16px] text-[rgba(240,240,240,0.4)] hover:text-[#F0F0F0] transition-colors backdrop-blur-[3px]`;
const GLASS_STYLE = { background: "rgba(27,27,27,0.2)", border: "1px solid rgba(240,240,240,0.2)" };

/* ── Body blocks ─────────────────────────────────────────────────────── */
/*
 * The rhythm, read off the frame:
 *   paragraph → paragraph   40   (Frame 506: pb 40)
 *   paragraph → image      100   (Frame 391: pb 100)
 *   caption   → paragraph  100   (Frame 820: pt 100)
 *   paragraph → quote       80   (Frame 820: pb 80)
 *   quote     → paragraph   80   (Frame 821: pt 80)
 *   heading   → paragraph   30   (Frame 822: pt 30)
 *   last text → rule       150   (Frame 823: pb 150)
 * Every block owns a 40px bottom; the larger gaps are the block's own top
 * padding on top of that 40, so any two blocks meet at the frame's distance
 * whatever order an editor puts them in.
 */
function RenderBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "text":
      return <p className={`${READ_16} text-[#9D9C9C] pb-[40px]`}>{block.content}</p>;

    case "html":
      /* The dashboard's HTML block. Same measure as a paragraph; inline
         emphasis takes the frame's smoke white, links the Read sky. */
      return (
        <div
          className={`${READ_16} text-[#9D9C9C] pb-[40px] [&_strong]:font-semibold [&_strong]:text-[#F0F0F0] [&_b]:font-semibold [&_b]:text-[#F0F0F0] [&_a]:text-[#5D94B9] [&_a:hover]:underline [&_p+p]:pt-[27px] [&_ul]:list-disc [&_ul]:pl-[24px] [&_ol]:list-decimal [&_ol]:pl-[24px]`}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "heading":
      /* Frame 391 (883:829): H4 — Inter 600 26/26 −0.75 — then 30 to the text. */
      return block.level === 3 ? (
        <h3 className={`${READ_16} font-semibold text-[#F0F0F0] pt-[20px] pb-[30px]`}>{block.content}</h3>
      ) : (
        <h2 className="text-[26px] leading-[26px] font-semibold tracking-[-0.75px] text-[#F0F0F0] pt-[40px] pb-[30px]">
          {block.content}
        </h2>
      );

    case "image":
      /* Frame 646 (883:777) + Frame 451 (883:792): a 650×500 card centred in
         the column, 1.5px hairline, the standard shadow, the photo at 80%;
         caption 20 below in Inter Medium 12 #363636. Colourises on scroll
         like every content photograph on the site. */
      return (
        <figure className="pt-[60px] pb-[100px] mx-auto w-full max-w-[650px]">
          <div
            className="relative h-[500px] rounded-[6px] overflow-hidden bg-[#0D0D0D]"
            style={{
              border: "1.5px solid rgba(240,240,240,0.1)",
              boxShadow: "0px 6px 20px 2px rgba(0,0,0,0.5)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-colorize
              src={block.content}
              alt={block.caption || ""}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </div>
          {(block.caption || block.credit) && (
            <figcaption className="pt-[20px] text-[12px] leading-[15px] font-medium text-[#363636]">
              {block.caption}
              {block.caption && block.credit ? " — " : ""}
              {block.credit}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      /* Frame 538 (883:799): indented 76 into the column, 551 wide, a 2px
         teal rule on the left, Source Sans 3 Medium Italic 18/25. */
      return (
        <blockquote className="pt-[40px] pb-[80px] sm:ml-[76px] max-w-[551px]">
          <p
            className="font-[family-name:var(--font-source-sans)] italic font-medium text-[18px] leading-[25px] tracking-[-0.09px] text-[#F0F0F0] pl-[30px]"
            style={{ borderLeft: "2px solid #32C6CC" }}
          >
            {block.content}
          </p>
        </blockquote>
      );

    case "divider":
      return (
        <div className="pt-[20px] pb-[60px]">
          <Rule />
        </div>
      );

    default:
      return null;
  }
}

/* ── Under the body: sources · resources · additional information ─── */

/* Frame 744 (896:1410) + Frame 802 (896:1412). Rule, eyebrow 60 below it,
   30 to the first entry; each entry is a 16/24 title over a 14/20 note with
   20 under it. Hidden without entries. */
function Sources({ items }: { items: ArticleSource[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <Rule />
      <p className={`${EYEBROW} pt-[60px] pb-[30px]`}>articles sources</p>
      {items.map((src, i) => (
        <div key={`${src.title}-${i}`} className="pb-[20px]">
          <p className={`${BODY_16} text-[#9D9C9C] pb-[5px]`}>
            {src.url ? (
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#F0F0F0] transition-colors">
                {src.title}
              </a>
            ) : (
              src.title
            )}
          </p>
          {src.description && <p className={`${BODY_14} text-[#363636]`}>{src.description}</p>}
        </div>
      ))}
    </section>
  );
}

/* Frame 742 (896:1367). Rule, then py 60: eyebrow, 14, rows 16 apart.
   A row: rgba(27,27,27,.4) · r6 · px 20 py 14 · chip + title on the left,
   size + icon on the right. A file with no URL (the frame's third row) is
   drawn inert — dimmer chip, dimmer title, no link — never a dead link. */
function Resources({ items }: { items: ArticleResource[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <Rule />
      <div className="py-[60px]">
        <p className={`${EYEBROW} pb-[14px]`}>Article Resources</p>
        <div className="flex flex-col gap-[16px]">
          {items.map((res, i) => {
            const live = Boolean(res.url);
            const row = (
              <>
                <span className="flex items-center gap-[12px] min-w-0">
                  {res.label && (
                    <span
                      className="shrink-0 px-[8px] py-[2px] rounded-[3px] text-[10px] leading-[15px] font-bold tracking-[0.12px] uppercase"
                      style={
                        live
                          ? { background: "rgba(50,198,204,0.2)", color: "#32C6CC" }
                          : { background: "#363636", color: "#595C5C" }
                      }
                    >
                      {res.label}
                    </span>
                  )}
                  <span className={`${BODY_14} truncate ${live ? "text-[#595C5C]" : "text-[#363636]"}`}>{res.title}</span>
                </span>
                <span className="flex items-center gap-[12px] shrink-0">
                  {res.sizeLabel && (
                    <span className="text-[12px] leading-[18px] font-normal text-[#363636]">{res.sizeLabel}</span>
                  )}
                  {live ? (
                    /* download arrow, 14px */
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-[#595C5C]">
                      <path d="M7 1.5v8M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    /* lock, 24px box */
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#363636]">
                      <rect x="6" y="11" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M9 11V8.5a3 3 0 016 0V11" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )}
                </span>
              </>
            );
            const cls =
              "flex items-center justify-between gap-[20px] w-full rounded-[6px] px-[20px] py-[14px] bg-[rgba(27,27,27,0.4)]";
            return live ? (
              <a
                key={`${res.title}-${i}`}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cls} transition-colors hover:bg-[rgba(27,27,27,0.7)]`}
              >
                {row}
              </a>
            ) : (
              <div key={`${res.title}-${i}`} className={cls} aria-disabled title="Not available">
                {row}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Frame 827 (896:1433) + Frame 828 (896:1435). Rule, eyebrow 60 below,
   30 to a 14/20 note in the darkest grey. */
function AdditionalInfo({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <section>
      <Rule />
      <p className={`${EYEBROW} pt-[60px] pb-[30px]`}>additional information</p>
      <p className={`${BODY_14} text-[#363636] whitespace-pre-line`}>{text}</p>
    </section>
  );
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
  const colorizeRef = useScrollColorize<HTMLElement>();
  void relatedArticles;

  /* Everything that belongs to the article's body — the photo strip, the
     sources, the resources — ships with the body. `PaywalledBody` calls
     `render` twice for a subscription piece: once with the server-cut
     preview (the same array the page arrived with) under the fade, and once
     with the blocks the API handed over. Only the second is the article.
     Comparing the reference is deliberate: a free article's body IS
     `article.body`, so it needs no second flag, and there is no fact to
     drift. */
  const afterBody = (blocks: ArticleBlock[]) =>
    article.access === "free" || blocks !== article.body;

  return (
    <main ref={colorizeRef} className="min-h-screen bg-[#0D0D0D] text-[#F0F0F0]">
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
            <ShareButton
              url={shareUrl}
              label="Share this article"
              className={GLASS_BTN}
              style={GLASS_STYLE}
              icon={<ArrowUpRight />}
            />
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
            render={(blocks) => (
              <>
                {blocks.map((block) => (
                  <RenderBlock key={block.id} block={block} />
                ))}
                {afterBody(blocks) && (
                  <>
                    {/* Full bleed inside the 800 column: break out to the
                        viewport. Frame 590 is py 120 on its own, so the 40
                        the last block leaves is taken back here. */}
                    {article.gallery.length > 0 && (
                      <div className="-mt-[40px] w-screen relative left-1/2 -translate-x-1/2">
                        <ArticleGallery images={article.gallery} />
                      </div>
                    )}
                    {/* Frame 823 ends 150 under its text: the last block
                        leaves 40, the gallery leaves 120 of its own. */}
                    <div className={article.gallery.length > 0 ? "pt-[30px]" : "pt-[110px]"}>
                      <Sources items={article.sources} />
                      <Resources items={article.resources} />
                      <AdditionalInfo text={article.additionalInfo} />
                    </div>
                  </>
                )}
              </>
            )}
          />
        </article>
      </div>

      <Footer />
    </main>
  );
}
