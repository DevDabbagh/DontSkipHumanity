"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { Article, ArticleBlock } from "@/lib/types";

const TAG_COLORS: Record<string, string> = {
  film: "bg-[#9B59B6]",
  screening: "bg-[#1ABC9C]",
  journalism: "bg-emerald-500",
  opinion: "bg-amber-500",
  field_notes: "bg-red-500",
  interview: "bg-indigo-500",
  academy: "bg-purple-500",
  impact: "bg-pink-500",
};

function RenderBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "text":
      return <p className="text-gray-300 leading-[1.9] mb-7 text-[15px]">{block.content}</p>;
    case "heading":
      return block.level === 2 ? (
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-14 mb-5 tracking-tight">{block.content}</h2>
      ) : (
        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{block.content}</h3>
      );
    case "image":
      return (
        <figure className="my-10 -mx-5 sm:mx-0">
          <img src={block.content} alt={block.caption || ""} className="w-full rounded-none sm:rounded-xl" />
          {(block.caption || block.credit) && (
            <figcaption className="text-xs text-gray-500 mt-3 px-5 sm:px-0">
              {block.caption}{block.credit && <span className="text-gray-600"> — {block.credit}</span>}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="my-10 relative pl-8 py-4">
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#9B59B6] to-[#1ABC9C] rounded-full" />
          <p className="text-xl text-gray-200 italic leading-relaxed">&ldquo;{block.content}&rdquo;</p>
        </blockquote>
      );
    case "divider":
      return <div className="gradient-divider my-12 max-w-xs mx-auto" />;
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
  const sectionRef = useReveal();
  const tagColor = TAG_COLORS[article.tag] ?? "bg-white/20";

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Read" backLabel="Read" backHref="/read" />

      {/* Hero image */}
      <section className="relative pt-14">
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <img src={article.mainImage} alt={article.title} className="absolute inset-0 w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent" />
        </div>
      </section>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 -mt-24 relative z-10" ref={sectionRef}>
        {/* Meta */}
        <div className="reveal mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs px-3 py-1 rounded-full ${tagColor} text-white font-medium capitalize`}>
              {article.tag.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight">{article.title}</h1>
          <p className="text-lg text-gray-400 mt-5 leading-relaxed">{article.excerpt}</p>
        </div>

        {/* Author */}
        <div className="reveal flex items-center gap-4 py-7 border-y border-white/5 mb-12">
          <img src={article.author.avatar} alt={article.author.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/5" />
          <div>
            <p className="text-sm text-white font-medium">{article.author.name}</p>
            {article.author.bio && <p className="text-xs text-gray-500 mt-0.5">{article.author.bio}</p>}
          </div>
        </div>

        {/* Body blocks */}
        <article className="reveal">
          {article.body.map((block) => (
            <RenderBlock key={block.id} block={block} />
          ))}
        </article>

        {/* Share / back */}
        <div className="py-12 border-t border-white/5 mt-12 flex items-center justify-between">
          <Link href="/read" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All articles
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Share</span>
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs">𝕏</button>
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs">in</button>
          </div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="reveal py-14 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">More to read</h2>
            <div className="space-y-7">
              {relatedArticles.map((ra) => (
                <Link key={ra.slug} href={`/read/${ra.slug}`} className="reveal block group">
                  <div className="flex gap-5">
                    <img src={ra.mainImage} alt={ra.title} className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-500" />
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_COLORS[ra.tag] ?? "bg-white/20"} text-white font-medium capitalize`}>
                        {ra.tag.replace("_", " ")}
                      </span>
                      <h3 className="text-white font-semibold mt-2 group-hover:text-gray-200 transition-colors">{ra.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ra.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
