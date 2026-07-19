"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

const ARTICLES = [
  {
    category: "Film",
    categoryColor: "bg-[#E74C3C]",
    date: "20 Jun 2026",
    title: "Free Fish: A Story of Resistance Under Siege",
    desc: "A completed short documentary directed by Bisan Owda — looking at daily life under conditions designed to make life impossible.",
    author: "Carolina Beltrão",
    slug: "free-fish-story-of-resistance",
    image: "/images/slider2.jpg",
  },
  {
    category: "Opinion",
    categoryColor: "bg-amber-500",
    date: "18 Jun 2026",
    title: "Why Ethical Storytelling Demands Accountability",
    desc: "Storytelling is never neutral. The way stories are told shapes whose lives are mourned and whose humanity is denied.",
    author: "Carolina Beltrão",
    slug: "ethical-storytelling-accountability",
    image: "/images/journalism.jpg",
  },
  {
    category: "Interview",
    categoryColor: "bg-indigo-500",
    date: "25 Jun 2026",
    title: "YALLA Podcast: Conversations with Palestinian Cultural Workers",
    desc: "An interview series amplifying voices that have been systematically ignored, silenced, or misrepresented.",
    author: "Tiago Zorro",
    slug: "yalla-podcast-launch",
    image: "/images/political-education.jpg",
  },
];

export default function Notebook() {
  const sectionRef = useReveal();

  return (
    <section id="read" className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto" ref={sectionRef}>
      {/* Featured article */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-12 sm:mb-20">
        <div className="reveal-left md:w-5/12">
          <Link href={`/read/${ARTICLES[0].slug}`} className="block">
            <div className="relative aspect-[3/4] max-w-[360px] rounded-lg overflow-hidden group">
              <img
                src="/images/note.jpg"
                alt="Featured article"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </Link>
        </div>
        <div className="reveal-right md:w-7/12 md:pt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-[0.25em] text-gray-500 uppercase">
              Notebook
            </p>
            <Link
              href="/read"
              className="text-sm border border-white/15 rounded-full px-4 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              view all notes ↗
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded bg-[#1ABC9C] text-white font-medium">
              Studio
            </span>
            <span className="text-xs text-gray-500">20 Jun 2026</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
            Free Fish — now available
            <br />
            to programmers and press
          </h2>

          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Bisan Owda&apos;s short documentary enters distribution. Screeners
            available on request for programmers, press, and partners. The film
            follows fishermen navigating restricted waters off Gaza&apos;s coast.
          </p>

          <p className="text-sm text-[#1ABC9C] mt-4">by Carolina Beltrão</p>

          <Link
            href={`/read/${ARTICLES[0].slug}`}
            className="mt-6 inline-block text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors"
          >
            Read more +
          </Link>
        </div>
      </div>

      {/* Article cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-5">
        {ARTICLES.map((article, i) => (
          <Link
            key={article.slug}
            href={`/read/${article.slug}`}
            className={`reveal-scale stagger-${i + 1} group cursor-pointer block`}
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded ${article.categoryColor} text-white font-medium`}>
                {article.category}
              </span>
              <span className="text-xs text-gray-500">{article.date}</span>
            </div>

            <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors leading-snug">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
              {article.desc}
            </p>
            <p className="text-sm text-[#1ABC9C] mt-3">by {article.author}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
