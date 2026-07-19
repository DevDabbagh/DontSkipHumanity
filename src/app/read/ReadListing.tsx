"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { Article } from "@/lib/types";

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

export default function ReadListing({ articles }: { articles: Article[] }) {
  const sectionRef = useReveal();
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Read" />

      <section className="pt-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Read</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight max-w-3xl">
            Journalism, opinion, and field notes
            <span className="gradient-text"> that refuse silence.</span>
          </h1>
          <p className="text-gray-400 mt-5 max-w-2xl leading-relaxed">
            Work that names what power tries to hide — essays, interviews, and dispatches from the frontlines of justice.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-20" ref={sectionRef}>
        {/* Featured article */}
        {featured && (
          <Link href={`/read/${featured.slug}`} className="reveal block group mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={featured.mainImage}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${TAG_COLORS[featured.tag] ?? "bg-white/20"} text-white font-medium capitalize`}>
                    {featured.tag.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(featured.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold group-hover:text-gray-200 transition-colors leading-tight">{featured.title}</h2>
                <p className="text-gray-400 mt-3 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-3 mt-5">
                  <img src={featured.author.avatar} alt={featured.author.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm text-gray-400">{featured.author.name}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="gradient-divider mb-12" />

        {/* Article grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {rest.map((article, i) => (
            <Link
              key={article.slug}
              href={`/read/${article.slug}`}
              className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <img
                  src={article.mainImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${TAG_COLORS[article.tag] ?? "bg-white/20"} text-white font-medium capitalize backdrop-blur-sm`}>
                    {article.tag.replace("_", " ")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h3 className="text-lg font-semibold text-white mt-1.5 group-hover:text-gray-200 transition-colors">{article.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{article.excerpt}</p>
              <p className="text-xs text-[#1ABC9C] mt-3">by {article.author.name}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
