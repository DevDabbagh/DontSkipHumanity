"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

const ARTICLES = [
  {
    category: "Read",
    categoryColor: "bg-[#1ABC9C]",
    date: "23 Aug 2026",
    title: "DSH redistributes $340K to community media projects",
    desc: "Funds distributed to 14 grassroots media organisations across the Global South following our spring solidarity campaign.",
    author: "Dima Mohammed",
    slug: "dsh-redistributes-340k",
    image: "/images/slider2.jpg",
  },
  {
    category: "Academy",
    categoryColor: "bg-[#32C6CC]",
    date: "23 Aug 2026",
    title: "New workshop: Ethical Narrative Journalism — open call",
    desc: "A free intensive developed with frontline journalists. Tools for covering occupation, displacement, and state violence with rigour and care.",
    author: "Margarida David Cardoso",
    slug: "ethical-narrative-journalism",
    image: "/images/journalism.jpg",
  },
  {
    category: "Films",
    categoryColor: "bg-[#B23495]",
    date: "23 Aug 2026",
    title: '"What We Carried" selected for IDFA 2026 competition',
    desc: "Our latest feature documentary enters the international competition section at the International Documentary Film Festival Amsterdam.",
    author: "Carolina Pereira",
    slug: "what-we-carried-idfa",
    image: "/images/political-education.jpg",
  },
];

export default function Notebook() {
  const sectionRef = useReveal();

  return (
    <section id="read" className="py-16 sm:py-20 lg:py-24" ref={sectionRef}>
      {/* Featured article — contained layout */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 mb-16 sm:mb-20">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Image — contained, not full-bleed */}
          <div className="reveal-left w-full md:w-5/12 group">
            <Link href="/read/free-fish-distribution" className="block">
              <ScrollColorImage
                src="/images/note.jpg"
                alt="Featured article"
                className="aspect-[3/4] rounded-[6px] group-hover:scale-[1.02] transition-transform duration-700"
              />
            </Link>
          </div>

          {/* Text content */}
          <div className="reveal-right w-full md:w-7/12 md:pt-2">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs tracking-[0.25em] text-dsh-label uppercase">
                Read
              </p>
              <Link
                href="/read"
                className="text-sm border border-dsh-text-primary/20 rounded-[3px] px-4 py-1.5 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors"
              >
                View all articles <span className="text-[#1ABC9C]">↗</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-[3px] bg-[#8665A7] text-white font-medium">
                Studio
              </span>
              <span className="text-xs text-[#1ABC9C]">23 Aug 2026</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight text-dsh-text-primary">
              Free Fish — now available
              <br />
              to programmers and press
            </h2>

            <p className="text-sm text-dsh-desc mt-5 leading-relaxed max-w-lg">
              Bisan Owda&apos;s short documentary enters distribution. Screeners
              available on request for programmers, press, and partners. Bisan
              Owda&apos;s short documentary enters distribution. Screeners
              available on request for programmers, press, and partners.
            </p>

            <div className="mt-5 mb-6 w-12 border-t border-white/10" />

            <p className="text-sm">
              <span className="text-dsh-desc">by </span>
              <span className="text-[#1ABC9C]">Diogo Faro</span>
            </p>

            <Link
              href="/read/free-fish-distribution"
              className="mt-6 inline-block text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors"
            >
              Read more <span className="text-[#1ABC9C]">+</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Article cards grid */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-6">
        {ARTICLES.map((article, i) => (
          <div
            key={article.slug}
            className={`reveal-scale stagger-${i + 1} group`}
          >
            <Link href={`/read/${article.slug}`} className="block">
              <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-4">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-[3px] ${article.categoryColor} text-white font-medium`}>
                {article.category}
              </span>
              <span className="text-xs text-[#1ABC9C]">{article.date}</span>
            </div>

            <h3 className="font-semibold text-dsh-text-primary leading-snug">
              {article.title}
            </h3>
            <p className="text-sm text-dsh-desc mt-2 leading-relaxed line-clamp-3">
              {article.desc}
            </p>

            <p className="text-sm mt-4">
              <span className="text-dsh-desc">by </span>
              <span className="text-[#1ABC9C]">{article.author}</span>
            </p>

            <Link
              href={`/read/${article.slug}`}
              className="mt-4 inline-block text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors"
            >
              Read more <span className="text-[#1ABC9C]">+</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
