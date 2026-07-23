"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CAROUSEL_ITEMS = [
  {
    type: "Documentary",
    typeColor: "text-[#D81B60]", // Matches vibrant pink from design
    title: "What We\nCarried",
    slug: "beneath-the-canopy",
    image: "/images/slider1.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#D81B60]",
    title: "Free Fish",
    slug: "free-fish",
    image: "/images/slider2.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#D81B60]",
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
    typeColor: "text-[#D81B60]",
    title: "Salt and\nLight",
    slug: "salt-and-light",
    image: "/images/studio.jpg",
  },
  {
    type: "Documentary",
    typeColor: "text-[#D81B60]",
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
  const initialChars = HERO_LINES[0].text.length + HERO_LINES[1].text.length;
  const [typedChars, setTypedChars] = useState(initialChars);
  const [showCursor, setShowCursor] = useState(true);
  const [carouselState, setCarouselState] = useState<'hidden' | 'center-visible' | 'full-visible'>('hidden');
  const router = useRouter();

  const fullText = HERO_LINES.map((l) => l.text).join("");
  const totalChars = fullText.length;

  useEffect(() => {
    if (typedChars >= totalChars) {
      const timer1 = setTimeout(() => setCarouselState('center-visible'), 150);
      const timer2 = setTimeout(() => setCarouselState('full-visible'), 900);
      const blinkTimer = setTimeout(() => setShowCursor(false), 2000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(blinkTimer);
      };
    }

    // Wait 500ms before starting to type the third line
    const speed = typedChars === initialChars ? 500 : Math.random() * 20 + 15;
    const timer = setTimeout(() => setTypedChars((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [typedChars, totalChars, initialChars]);

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
    // Wait for the entrance animation to finish before starting the timer,
    // and set the interval to 10 seconds (10000ms)
    if (carouselState !== 'full-visible') return;

    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next, carouselState]);

  // Map all items to create a continuous looping track with absolute positioning
  const getVisibleItems = () => {
    const total = CAROUSEL_ITEMS.length;
    return CAROUSEL_ITEMS.map((item, index) => {
      let offset = index - activeIndex;
      // Normalize to shortest path
      if (offset > Math.floor(total / 2)) offset -= total;
      if (offset < -Math.floor(total / 2)) offset += total;
      return { item, index, offset };
    });
  };

  const visibleItems = getVisibleItems();

  return (
    <section className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
      {/* Hero text — typewriter effect */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 text-center mb-6 sm:mb-8 lg:mb-10">
        <div className="mb-1 sm:mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.2rem] font-semibold tracking-tight text-white/90 leading-[1.3]">
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
      </div>

      {/* Carousel — matching Figma design exactly */}
      <div className="relative group">
        <div className="carousel-animate relative overflow-hidden py-4 lg:py-8">
          {/* Spotlight/Glow effect behind the active card to create a strong focus */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="carousel-track relative w-full h-[300px] sm:h-[340px] md:h-[400px] lg:h-[440px] z-10">
          {visibleItems.map(({ item, index, offset }) => {
            const isActive = offset === 0;
            const isNear = Math.abs(offset) === 1;

            // Smaller cards so full slider visible on first load
            const cardWidth = isActive
              ? "w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
              : isNear
                ? "w-[140px] sm:w-[170px] md:w-[210px] lg:w-[240px]"
                : "w-[110px] sm:w-[140px] md:w-[170px] lg:w-[190px]";

            const cardHeight = isActive
              ? "h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px]"
              : isNear
                ? "h-[230px] sm:h-[270px] md:h-[320px] lg:h-[360px]"
                : "h-[190px] sm:h-[220px] md:h-[270px] lg:h-[300px]";

            // Smooth Transform calculation using exact CSS to avoid Tailwind JIT issues
            let translateX = "-50%";
            let zIndexClass = "z-10";
            let shadowClass = "shadow-2xl shadow-black/40 border-white/10";
            let baseOpacity = "opacity-100";

            if (offset === -1) { translateX = "-170%"; zIndexClass = "z-[5]"; shadowClass = "border-white/[0.06]"; }
            else if (offset === 1) { translateX = "70%"; zIndexClass = "z-[5]"; shadowClass = "border-white/[0.06]"; }
            else if (offset === -2) { translateX = "-320%"; zIndexClass = "z-[2]"; shadowClass = "border-white/[0.04]"; }
            else if (offset === 2) { translateX = "220%"; zIndexClass = "z-[2]"; shadowClass = "border-white/[0.04]"; }
            else if (offset < -2) { translateX = "-450%"; zIndexClass = "z-0 pointer-events-none"; shadowClass = "border-white/[0.01]"; baseOpacity = "opacity-0"; }
            else if (offset > 2) { translateX = "350%"; zIndexClass = "z-0 pointer-events-none"; shadowClass = "border-white/[0.01]"; baseOpacity = "opacity-0"; }

            // Entrance animation styles
            let finalOpacity = baseOpacity;
            let finalTransform = `translateX(${translateX}) scale(1)`;

            if (carouselState === 'hidden') {
              finalOpacity = "opacity-0";
              finalTransform = `translateX(${translateX}) translateY(40px) scale(0.9)`;
            } else if (carouselState === 'center-visible') {
              if (isActive) {
                finalOpacity = "opacity-100";
                finalTransform = `translateX(${translateX}) translateY(0) scale(1)`;
              } else {
                finalOpacity = "opacity-0";
                const slideStartX = offset > 0 ? "300%" : "-400%";
                finalTransform = `translateX(${slideStartX}) translateY(0) scale(0.95)`;
              }
            }

            return (
              <div
                key={index}
                onClick={() => {
                  if (isActive && item.slug) {
                    router.push(`/film/${item.slug}`);
                  } else {
                    goTo(index);
                  }
                }}
                className={`absolute left-1/2 top-1/2 overflow-hidden cursor-pointer rounded-[8px] origin-center
                  transition-all duration-[1200ms] ease-[cubic-bezier(0.2,1,0.2,1)]
                  ${cardWidth} ${cardHeight}
                  ${finalOpacity}
                  ${zIndexClass} border ${shadowClass}
                `}
                style={{ transform: `${finalTransform} translateY(-50%)` }}
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
                    ? "bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/30 to-transparent"
                    : "bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-[#0D0D0D]/50"
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
                      className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-white/20 rounded-full backdrop-blur-md bg-white/[0.08] px-3 py-1.5 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/[0.14] transition-all duration-300 ${
                        isActive ? "text-[11px] sm:text-[12px]" : "text-[9px] sm:text-[10px]"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      view more <span className="text-[#D81B60]">+</span>
                    </Link>
                  ) : (
                    <span className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-white/20 rounded-full backdrop-blur-md bg-white/[0.08] px-3 py-1.5 text-white/60 ${
                      isActive ? "text-[11px] sm:text-[12px]" : "text-[9px] sm:text-[10px]"
                    }`}>
                      view more <span className="text-[#D81B60]">+</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Edge Shadows (Fade) to blend into the background seamlessly */}
        <div className="absolute top-0 bottom-0 left-0 w-[20%] lg:w-[25%] bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 to-transparent pointer-events-none z-50" />
        <div className="absolute top-0 bottom-0 right-0 w-[20%] lg:w-[25%] bg-gradient-to-l from-[#0D0D0D] via-[#0D0D0D]/90 to-transparent pointer-events-none z-50" />

        </div>

        {/* Arrows — circular, outside the mask so they don't fade, shown on hover for cleaner UI */}
        {carouselState === 'full-visible' && (
          <>
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
          </>
        )}
      </div>

      {/* Welcome text — delayed entrance */}
      <div className={`welcome-animate text-center mt-10 sm:mt-14 transition-all duration-1000 ${carouselState === 'full-visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs sm:text-sm text-gray-500 tracking-wide">Welcome to our world!</p>
        <div className="welcome-line-animate w-px bg-gray-600 mx-auto mt-3 h-[40px]" />
      </div>
    </section>
  );
}
