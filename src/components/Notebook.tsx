"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

/* Cinematic image treatment matching the dark interface */
const IMG_STYLE = { filter: "brightness(0.92) contrast(0.95) saturate(0.88)" };

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
    <section id="read" className="py-10 sm:py-12 lg:py-16" ref={sectionRef}>
      {/* ── Featured article ── */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 mb-20 sm:mb-28 lg:mb-32">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-14">
          {/* Portrait — slightly smaller, cinematic treatment */}
          <div className="reveal-left w-full md:w-[38%] max-w-[380px] group">
            <Link href="/read/free-fish-distribution" className="block">
              <ScrollColorImage
                src="/images/note.jpg"
                alt="Featured article"
                className="aspect-[3/4] rounded-[4px] border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                imgClassName="group-hover:scale-[1.02] transition-transform duration-700"
              />
            </Link>
          </div>

          {/* Content — top-aligned with image */}
          <div className="reveal-right w-full md:w-[62%] md:pt-0">
            {/* Label + View all — separated row */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] tracking-[0.3em] text-dsh-label/40 uppercase">
                Read
              </p>
              <Link
                href="/read"
                className="text-xs border border-dsh-text-primary/15 rounded-[3px] px-3.5 py-1.5 text-dsh-text-primary/35 hover:text-dsh-text-primary/55 hover:border-dsh-text-primary/25 transition-colors"
              >
                View all articles <span className="text-[#1ABC9C]">↗</span>
              </Link>
            </div>

            {/* Category + date */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[#8665A7] text-white font-medium">
                Studio
              </span>
              <span className="text-xs text-[#1ABC9C]">23 Aug 2026</span>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-semibold leading-[1.2] text-[#F0F0F0] max-w-md">
              Free Fish — now available
              <br />
              to programmers and press
            </h2>

            {/* Description */}
            <p className="text-[13px] text-dsh-desc mt-6 leading-[1.7] max-w-md">
              Bisan Owda&apos;s short documentary enters distribution. Screeners
              available on request for programmers, press, and partners. Bisan
              Owda&apos;s short documentary enters distribution. Screeners
              available on request for programmers, press, and partners.
            </p>

            {/* Divider */}
            <div className="mt-6 mb-5 w-10 border-t border-white/[0.08]" />

            {/* Author */}
            <p className="text-[13px]">
              <span className="text-dsh-desc">by </span>
              <span className="text-[#1ABC9C]">Diogo Faro</span>
            </p>

            {/* Button — minimal */}
            <Link
              href="/read/free-fish-distribution"
              className="mt-7 inline-block text-xs border border-dsh-text-primary/15 rounded-[3px] px-4 py-1.5 text-dsh-text-primary/35 hover:text-dsh-text-primary/55 hover:border-dsh-text-primary/25 transition-colors"
            >
              Read more <span className="text-[#1ABC9C]">+</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Editorial grid ── */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-8 lg:gap-10">
        {ARTICLES.map((article, i) => (
          <div
            key={article.slug}
            className={`reveal-scale stagger-${i + 1} group`}
          >
            {/* Image — uniform aspect, cinematic treatment */}
            <Link href={`/read/${article.slug}`} className="block mb-5">
              <ScrollColorImage
                src={article.image}
                alt={article.title}
                className="aspect-[16/10] rounded-[4px] border border-white/[0.06]"
                imgClassName="group-hover:scale-[1.03] transition-transform duration-500"
              />
            </Link>

            {/* Category + date */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[11px] px-2 py-0.5 rounded-[3px] ${article.categoryColor} text-white font-medium`}>
                {article.category}
              </span>
              <span className="text-xs text-[#1ABC9C]">{article.date}</span>
            </div>

            {/* Headline */}
            <h3 className="text-[15px] sm:text-base font-semibold text-[#F0F0F0] leading-snug">
              {article.title}
            </h3>

            {/* Description */}
            <p className="text-[13px] text-dsh-desc mt-3 leading-[1.7] line-clamp-3">
              {article.desc}
            </p>

            {/* Author */}
            <p className="text-[13px] mt-5">
              <span className="text-dsh-desc">by </span>
              <span className="text-[#1ABC9C]">{article.author}</span>
            </p>

            {/* Button */}
            <Link
              href={`/read/${article.slug}`}
              className="mt-5 inline-block text-xs border border-dsh-text-primary/15 rounded-[3px] px-4 py-1.5 text-dsh-text-primary/35 hover:text-dsh-text-primary/55 hover:border-dsh-text-primary/25 transition-colors"
            >
              Read more <span className="text-[#1ABC9C]">+</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
