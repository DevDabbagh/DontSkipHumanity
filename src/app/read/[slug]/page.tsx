import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "@/lib/api";
import ArticleContent from "./ArticleContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — DSH" };
  return {
    title: `${article.title} — Don't Skip Humanity`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return <ArticleContent article={article} relatedArticles={relatedArticles} />;
}
