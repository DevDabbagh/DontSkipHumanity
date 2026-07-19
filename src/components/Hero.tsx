"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CAROUSEL_ITEMS = [
  {
    type: "Documentary",
    typeColor: "text-[#E74C3C]",
    title: "What We\nCarried",
    slug: "beneath-the-canopy",
    image: "/images/slider1.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#E74C3C]",
    title: "Free Fish",
    slug: "free-fish",
    image: "/images/slider2.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#E74C3C]",
    title: "Bisan Owda\nInside Creators",
    slug: "salt-and-light",
    image: "/images/journalism.jpg",
  },
  {
    type: "Youtube Series",
    typeColor: "text-[#9B59B6]",
    title: "Saber Não\nOcupa Espaço",
    slug: "the-classroom",
    image: "/images/political-education.jpg",
  },
  {
    type: "Academy",
    typeColor: "text-[#9B59B6]",
    title: "Catarina Marques\nRodrigues",
    slug: null,
    image: "/images/slidere3.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#E74C3C]",
    title: "Salt and\nLight",
    slug: "salt-and-light",
    image: "/images/studio.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#E74C3C]",
    title: "The\nClassroom",
    slug: "the-classroom",
    image: "/images/infocus.jpg",
  },
];

const HERO_LINES = [
  { text: "An independent media company creating films,", gradient: false },
  { text: " journalism and educational projects rooted in", gradient: false },
  { text: " dignity, witness and collective liberation.", gradient: true },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const fullText = HERO_LINES.map((l) => l.text).join("");
  const totalChars = fullText.length;

  useEffect(() => {
    if (typedChars >= totalChars) {
      const blinkTimer = setTimeout(() => setShowCursor(false), 2000);
      return () => clearTimeout(blinkTimer);
    }
    const speed = typedChars === 0 ? 600 : Math.random() * 30 + 25;
    const timer = setTimeout(() => setTypedChars((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [typedChars, totalChars]);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  const next = useCallback(() => {
    goTo((activeIndex + 1) % CAROUSEL_ITEMS.length);
  }, [activeIndex, goTo]);

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Show 5 items: -2 to +2 (edge cards clip at viewport)
  const getVisibleItems = () => {
    const total = CAROUSEL_ITEMS.length;
    const items: { item: (typeof CAROUSEL_ITEMS)[0]; index: number; offset: number }[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = ((activeIndex + offset) % total + total) % total;
      items.push({ item: CAROUSEL_ITEMS[idx], index: idx, offset });
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <section className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
      {/* Hero text — typewriter effect */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 text-center mb-10 sm:mb-14 lg:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] lg:text-[3.2rem] font-semibold leading-[1.25] tracking-tight">
          {(() => {
            let charCount = 0;
            return HERO_LINES.map((line, i) => {
              const lineStart = charCount;
              charCount += line.text.length;
              const visibleLen = Math.max(0, Math.min(line.text.length, typedChars - lineStart));
              const visibleText = line.text.slice(0, visibleLen);
              const isCursorHere = typedChars >= lineStart && typedChars < lineStart + line.text.length;

              return (
                <span key={i}>
                  {i > 0 && <br className="hidden md:block" />}
                  {line.gradient ? (
                    <span className="gradient-text-static">{visibleText}</span>
                  ) : (
                    <span>{visibleText}</span>
                  )}
                  {isCursorHere && showCursor && (
                    <span className="typing-cursor">|</span>
                  )}
                </span>
              );
            });
          })()}
          {typedChars >= totalChars && showCursor && (
            <span className="typing-cursor">|</span>
          )}
        </h1>
      </div>

      {/* Carousel — matching Figma design exactly */}
      <div className="relative group">
        <div className="carousel-animate relative overflow-hidden py-4 lg:py-8 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          {/* Spotlight/Glow effect behind the active card to create a strong focus */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
        
        <div className="carousel-track flex items-end justify-center gap-3 sm:gap-4 md:gap-5 relative z-10">
          {visibleItems.map(({ item, index, offset }) => {
            const isActive = offset === 0;
            const isNear = Math.abs(offset) === 1;

            // Smaller cards so full slider visible on first load
            const cardWidth = isActive
              ? "w-[220px] sm:w-[260px] md:w-[300px] lg:w-[340px]"
              : isNear
                ? "w-[170px] sm:w-[200px] md:w-[240px] lg:w-[270px]"
                : "w-[140px] sm:w-[170px] md:w-[200px] lg:w-[220px]";

            const cardHeight = isActive
              ? "h-[320px] sm:h-[360px] md:h-[420px] lg:h-[460px]"
              : isNear
                ? "h-[270px] sm:h-[310px] md:h-[360px] lg:h-[400px]"
                : "h-[230px] sm:h-[260px] md:h-[310px] lg:h-[340px]";

            return (
              <div
                key={index}
                onClick={() => goTo(index)}
                style={{ order: offset + 2 }}
                className={`relative overflow-hidden cursor-pointer shrink-0 rounded-[4px]
                  transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${cardWidth} ${cardHeight}
                  ${isActive
                    ? "z-10 border border-white/10 shadow-2xl shadow-black/40"
                    : isNear
                      ? "z-[5] border border-white/[0.06]"
                      : "z-[2] border border-white/[0.04]"
                  }
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? "scale-100 grayscale-0" : "scale-[1.02] grayscale"
                  }`}
                />
                {/* Layer overlay: center = subtle bottom gradient; sides = heavy dark */}
                <div className={`absolute inset-0 transition-all duration-[1100ms] ${
                  isActive
                    ? "bg-gradient-to-t from-black/80 via-black/10 to-transparent"
                    : "bg-gradient-to-t from-black/95 via-black/70 to-black/40"
                }`} />

                {/* Card content */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}>
                  <span className={`text-[9px] sm:text-[10px] font-medium tracking-wider uppercase ${item.typeColor}`}>
                    {item.type}
                  </span>
                  <h3 className={`text-white font-bold whitespace-pre-line leading-[1.15] mt-1 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "text-[20px] sm:text-[24px] md:text-[28px]"
                      : isNear
                        ? "text-[16px] sm:text-[18px] md:text-[20px]"
                        : "text-[13px] sm:text-[15px] md:text-[17px]"
                  }`}>
                    {item.title}
                  </h3>
                  {/* Pill button — backdrop blur, bordered */}
                  {item.slug ? (
                    <Link
                      href={`/film/${item.slug}`}
                      className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-white/20 rounded-[4px] backdrop-blur-md bg-white/[0.08] px-3 py-1.5 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/[0.14] transition-all duration-300 ${
                        isActive ? "text-[11px] sm:text-[12px]" : "text-[9px] sm:text-[10px]"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      view more <span className="text-[#E74C3C]">+</span>
                    </Link>
                  ) : (
                    <span className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-white/20 rounded-[4px] backdrop-blur-md bg-white/[0.08] px-3 py-1.5 text-white/60 ${
                      isActive ? "text-[11px] sm:text-[12px]" : "text-[9px] sm:text-[10px]"
                    }`}>
                      view more <span className="text-[#E74C3C]">+</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        </div>

        {/* Arrows — circular, outside the mask so they don't fade, shown on hover for cleaner UI */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:border-white/30 transition-all duration-300 z-20 backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-2 sm:right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:border-white/30 transition-all duration-300 z-20 backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Welcome text — delayed entrance */}
      <div className="welcome-animate text-center mt-10 sm:mt-14">
        <p className="text-xs sm:text-sm text-gray-500 tracking-wide">Welcome to our world!</p>
        <div className="welcome-line-animate w-px bg-gray-600 mx-auto mt-3" />
      </div>
    </section>
  );
}
