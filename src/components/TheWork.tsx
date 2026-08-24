"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ScrollColorImage from "./ScrollColorImage";
import CurtainReveal from "./CurtainReveal";
import type { LandingSectionText } from "@/lib/landing";

interface CurtainConfig extends LandingSectionText {
  imageSrc?: string;
}

/* ── Section header — one-time fade-in ── */
function SectionHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-[1400px] mx-auto px-5 sm:px-8">
      <div
        className={`mb-16 sm:mb-20 lg:mb-24 transition-opacity duration-700 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-4">
          The work, in its forms
        </p>
        <h2 className="text-[26px] sm:text-[32px] md:text-[38px] leading-tight md:leading-[40px] tracking-[-0.57px] font-semibold max-w-5xl text-dsh-text-primary">
          Films, series, journalism, and education
          <br className="hidden sm:block" />
          that name power and refuse erasure.
        </h2>
      </div>
    </div>
  );
}

export default function TheWork({
  filmsConfig,
  studioConfig,
  showFilms = true,
  showStudio = true,
}: {
  filmsConfig?: CurtainConfig;
  studioConfig?: CurtainConfig;
  showFilms?: boolean;
  showStudio?: boolean;
}) {
  if (!showFilms && !showStudio) return null;

  return (
    <section id="films" className="py-10 sm:py-12 lg:py-16">
      <SectionHeader />

      {/* Films: image left → slides to reveal text right */}
      {showFilms && <CurtainReveal
        className="mb-20 sm:mb-24 lg:mb-28"
        image={
          <ScrollColorImage
            src={filmsConfig?.imageSrc || "/images/slider1.jpg"}
            alt="Elderly hands clasped together"
            className="h-full md:rounded-tr-[6px] md:rounded-br-[6px]"
          />
        }
      >
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          {filmsConfig?.heading || "Films"}
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.2111 11.1056L9.73666 7.86833C8.93878 7.46939 8 8.04958 8 8.94164V15.0584C8 15.9504 8.93878 16.5306 9.73666 16.1317L16.2111 12.8944C16.9482 12.5259 16.9482 11.4741 16.2111 11.1056Z" stroke="#B23495" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h3>
        <p className="font-[family-name:var(--font-source-sans)] text-[14px] sm:text-[15px] text-dsh-desc mt-2 sm:mt-3 md:mt-4 leading-[22px] max-w-lg line-clamp-4 min-h-[4.9rem] sm:min-h-[5.7rem]">
          {filmsConfig?.description ||
            "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human — and refuse the distance through which violence is made acceptable. Festivals, screenings, distribution, and the political context around each film."}
        </p>
        <Link href="/films" className="mt-3 sm:mt-4 md:mt-6 inline-flex items-center gap-1.5 self-start text-[13px] font-medium border border-[#F0F0F0]/20 bg-[#1B1B1B]/20 rounded-[3px] px-[17px] py-[13px] text-[#F0F0F0]/40 hover:text-[#F0F0F0]/60 transition-colors">
          {filmsConfig?.cta || "Explore Films"} <span className="text-[#B23495]">+</span>
        </Link>
      </CurtainReveal>}

      {/* Studio: mirrored — image right → slides to reveal text left */}
      {showStudio && <CurtainReveal
        mirrored
        image={
          <ScrollColorImage
            src={studioConfig?.imageSrc || "/images/studio.jpg"}
            alt="Studio portrait"
            className="h-full md:rounded-tl-[6px] md:rounded-bl-[6px]"
          />
        }
      >
        <div id="studio" className="absolute" />
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          {studioConfig?.heading || "Studio"}
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="#8665A7" strokeLinejoin="round"/>
            <path d="M5.5 11C5.5 12.7239 6.18482 14.3772 7.40381 15.5962C8.62279 16.8152 10.2761 17.5 12 17.5C13.7239 17.5 15.3772 16.8152 16.5962 15.5962C17.8152 14.3772 18.5 12.7239 18.5 11" stroke="#8665A7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 21V19" stroke="#8665A7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h3>
        <p className="font-[family-name:var(--font-source-sans)] text-[14px] sm:text-[15px] text-dsh-desc mt-2 sm:mt-3 md:mt-4 leading-[22px] max-w-lg line-clamp-4 min-h-[4.9rem] sm:min-h-[5.7rem]">
          {studioConfig?.description ||
            "Docuseries, videocasts, podcasts, and series — and the production and co-production capacity behind them. Bold, independent media that strengthens movements, made with the same politics and care."}
        </p>
        <Link href="/studio" className="mt-3 sm:mt-4 md:mt-6 inline-flex items-center gap-1.5 self-start text-[13px] font-medium border border-[#F0F0F0]/20 bg-[#1B1B1B]/20 rounded-[3px] px-[17px] py-[13px] text-[#F0F0F0]/40 hover:text-[#F0F0F0]/60 transition-colors">
          {studioConfig?.cta || "Explore Studio"} <span className="text-[#8665A7]">+</span>
        </Link>
      </CurtainReveal>}
    </section>
  );
}
