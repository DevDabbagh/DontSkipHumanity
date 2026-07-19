import { notFound } from "next/navigation";
import { getArticleBySlug, MOCK_ARTICLES } from "@/lib/mock-data";
import ArticleContent from "./ArticleContent";

export function generateStaticParams() {
  return MOCK_ARTICLES.filter((a) => a.status === "published").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — DSH" };
  return {
    title: `${article.title} — Don't Skip Humanity`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = MOCK_ARTICLES
    .filter((a) => a.slug !== article.slug && a.status === "published")
    .slice(0, 3);

  return <ArticleContent article={article} relatedArticles={relatedArticles} />;
}
