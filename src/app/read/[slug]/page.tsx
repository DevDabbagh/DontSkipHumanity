import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getArticleBySlug, getArticles } from "@/lib/api";
import ArticleContent from "./ArticleContent";
import type { ArticleBlock } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — DSH" };
  return {
    title: `${article.title} — Don't Skip Humanity`,
    description: article.excerpt,
  };
}


/**
 * The few paragraphs a non-subscriber is allowed to read.
 *
 * Cut HERE, on the server, and not with CSS further down. A page that ships
 * the whole article and hides the rest behind a gradient has not withheld
 * anything — the text is in the source either way. Only these characters ever
 * leave the machine.
 *
 * Text and headings only: an image or a pull quote inside the free slice would
 * give away the piece's best moment, which is usually the one someone is being
 * asked to pay for.
 */
function previewOf(body: ArticleBlock[], maxChars = 420): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  let used = 0;

  for (const block of body) {
    if (block.type !== "text" && block.type !== "heading") continue;
    const remaining = maxChars - used;
    if (remaining <= 0) break;

    if (block.content.length <= remaining) {
      out.push(block);
      used += block.content.length;
      continue;
    }

    /* Cut at a word, never mid-word, and never mid-sentence if a full stop is
       close enough to the limit to read as a natural pause. */
    const slice = block.content.slice(0, remaining);
    const lastStop = slice.lastIndexOf(". ");
    const cut = lastStop > remaining * 0.5 ? lastStop + 1 : slice.lastIndexOf(" ");
    out.push({ ...block, content: slice.slice(0, cut > 0 ? cut : remaining).trimEnd() });
    break;
  }

  return out;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  /* Related articles are CARDS — title, excerpt, image, slug. They do not need
     a body, and shipping one is how a paywall leaks sideways: stripping the
     body of the article being read means nothing if the page also carries the
     full text of three others, one of which may be a subscription piece. */
  const allArticles = await getArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => ({ ...a, body: [] }));

  /* THE PAYWALL IS HERE, not in the markup.
     A subscription article is sent to the browser with an empty body. The
     client asks `/api/read/[slug]` for the text with the reader's own token,
     and that route decides. Drawing a card over the words would leave them in
     the page source; this way there is nothing to reveal. */
  const safeArticle =
    article.access === "subscription"
      ? { ...article, body: previewOf(article.body) }
      : article;

  /* No second flag for "is it free": `access` travels on the article itself,
     and PaywalledBody reads it. Two sources for one fact is how they drift. */
  return <ArticleContent article={safeArticle} relatedArticles={relatedArticles} />;
}
