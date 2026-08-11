"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HeroSlide } from "@/lib/landing";

interface CarouselSlide {
  id: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  poster: string;
  type: string;
  typeColor: string;
  title: string;
  href: string | null;
}

const DEFAULT_RAW_ITEMS = [
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

const DEFAULT_ITEMS: CarouselSlide[] = DEFAULT_RAW_ITEMS.map((item, i) => ({
  id: `hero-default-${i}`,
  mediaType: "image",
  mediaSrc: item.image,
  poster: item.image,
  type: item.type,
  typeColor: item.typeColor,
  title: item.title,
  href: item.slug ? `/film/${item.slug}` : null,
}));

function typeColorFor(type: string) {
  return /series|academy/i.test(type) ? "text-[#9B59B6]" : "text-[#D81B60]";
}

const HERO_LINES = [
  { text: "An independent media company creating films,", gradient: false },
  { text: " journalism and educational projects rooted in", gradient: false },
  { text: " dignity, witness and collective liberation.", gradient: true },
];

export default function Hero({ slides }: { slides?: HeroSlide[] | null }) {
  const items = useMemo<CarouselSlide[]>(() => {
    if (slides && slides.length > 0) {
      return slides.map((s) => ({ ...s, typeColor: typeColorFor(s.type) }));
    }
    return DEFAULT_ITEMS;
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const initialChars = HERO_LINES[0].text.length + HERO_LINES[1].text.length;
  const [typedChars, setTypedChars] = useState(initialChars);
  const [showCursor, setShowCursor] = useState(true);
  const [carouselState, setCarouselState] = useState<'hidden' | 'center-visible' | 'full-visible'>('hidden');
  const [nearTop, setNearTop] = useState(true);
  const router = useRouter();

  // Scroll indicator only lives near the top of the page — it unmounts as soon as
  // you scroll away, and remounts (replaying its entrance) when you scroll back up.
  useEffect(() => {
    const handleScroll = () => setNearTop(window.scrollY < 120);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    goTo((activeIndex + 1) % items.length);
  }, [activeIndex, goTo, items.length]);

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, goTo, items.length]);

  useEffect(() => {
    // Wait for the entrance animation to finish before starting the timer,
    // and set the interval to 10 seconds (10000ms)
    if (carouselState !== 'full-visible') return;

    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next, carouselState]);

  // Map all items to create a continuous looping track with absolute positioning
  const getVisibleItems = () => {
    const total = items.length;
    return items.map((item, index) => {
      let offset = index - activeIndex;
      // Normalize to shortest path
      if (offset > Math.floor(total / 2)) offset -= total;
      if (offset < -Math.floor(total / 2)) offset += total;
      return { item, index, offset };
    });
  };

  const visibleItems = getVisibleItems();

  return (
    <section className="pt-24 sm:pt-28 lg:pt-36 xl:pt-[170px] pb-8 sm:pb-12">
      {/* Hero text — typewriter effect */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-[70px]">
        <div className="mb-1 sm:mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[50px] font-semibold tracking-tight text-white/90 leading-[1.3] xl:leading-[1.04]">
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
        <div className="carousel-animate relative overflow-hidden py-4 lg:py-8 xl:pt-0 xl:pb-8">
          {/* Spotlight/Glow effect behind the active card to create a strong focus */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="carousel-track relative w-full h-[300px] sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[480px] z-10">
          {visibleItems.map(({ item, index, offset }) => {
            const isActive = offset === 0;
            const isNear = Math.abs(offset) === 1;

            // Card sizes — active/near/far each step down by the same ~5/6 ratio
            // used in the Figma spec (360x450 / 300x375 / 250x313 at desktop).
            const cardWidth = isActive
              ? "w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] xl:w-[360px]"
              : isNear
                ? "w-[140px] sm:w-[170px] md:w-[210px] lg:w-[240px] xl:w-[300px]"
                : "w-[110px] sm:w-[140px] md:w-[170px] lg:w-[190px] xl:w-[250px]";

            const cardHeight = isActive
              ? "h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] xl:h-[450px]"
              : isNear
                ? "h-[230px] sm:h-[270px] md:h-[320px] lg:h-[360px] xl:h-[375px]"
                : "h-[190px] sm:h-[220px] md:h-[270px] lg:h-[300px] xl:h-[313px]";

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
                  if (isActive && item.href) {
                    router.push(item.href);
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
                {/* Video slides only load + play once they're active — every other
                    slide (including inactive video slides) just shows its poster. */}
                {item.mediaType === "video" && isActive ? (
                  <video
                    key={`${item.id}-playing`}
                    src={item.mediaSrc}
                    poster={item.poster || undefined}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] scale-100 grayscale-0"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.poster || item.mediaSrc}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? "scale-100 grayscale-0" : "scale-[1.02] grayscale"
                    }`}
                  />
                )}
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
                  <span className={`font-medium tracking-wider uppercase ${item.typeColor} ${
                    isActive
                      ? "text-[9px] sm:text-[10px] xl:text-[13px]"
                      : isNear
                        ? "text-[9px] sm:text-[10px] xl:text-[12px]"
                        : "text-[9px] sm:text-[10px] xl:text-[11px]"
                  }`}>
                    {item.type}
                  </span>
                  <h3 className={`text-white font-bold whitespace-pre-line leading-[1.15] mt-1 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "text-[20px] sm:text-[24px] md:text-[28px] xl:text-[30px]"
                      : isNear
                        ? "text-[16px] sm:text-[18px] md:text-[20px] xl:text-[26px]"
                        : "text-[13px] sm:text-[15px] md:text-[17px] xl:text-[22px]"
                  }`}>
                    {item.title}
                  </h3>
                  {/* Pill button — backdrop blur, bordered. Padding/size decreases for near + far cards. */}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-dsh-text-primary/20 rounded-[3px] bg-dsh-btn-bg/20 backdrop-blur-sm text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-all duration-300 ${
                        isActive
                          ? "px-3 py-1.5 text-[11px] sm:text-[12px] xl:px-5 xl:py-2.5 xl:text-[13px]"
                          : isNear
                            ? "px-3 py-1.5 text-[9px] sm:text-[10px] xl:px-4 xl:py-2 xl:text-[11px]"
                            : "px-3 py-1.5 text-[9px] sm:text-[10px] xl:px-3 xl:py-1.5 xl:text-[10px]"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      view more <span className="text-[#B23495]">+</span>
                    </Link>
                  ) : (
                    <span className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 border border-dsh-text-primary/20 rounded-[3px] bg-dsh-btn-bg/20 text-dsh-text-primary/40 ${
                      isActive
                        ? "px-3 py-1.5 text-[11px] sm:text-[12px] xl:px-5 xl:py-2.5 xl:text-[13px]"
                        : isNear
                          ? "px-3 py-1.5 text-[9px] sm:text-[10px] xl:px-4 xl:py-2 xl:text-[11px]"
                          : "px-3 py-1.5 text-[9px] sm:text-[10px] xl:px-3 xl:py-1.5 xl:text-[10px]"
                    }`}>
                      view more <span className="text-[#B23495]">+</span>
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

      {/* Welcome text + scroll indicator — fades in once the hero settles, and fades
          back out (not just via CSS delay, but tied to actual scroll position) as soon
          as you scroll away. Comes back the moment you're back near the top. */}
      <div className={`text-center mt-10 sm:mt-14 transition-all duration-700 ease-out ${
        carouselState === 'full-visible' && nearTop
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}>
        <p className="text-xs sm:text-sm text-gray-500 tracking-wide">Welcome to our world!</p>

        {/* Mounted/unmounted (not just faded) based on scroll position so the dot +
            chevron animation genuinely replays every time you scroll back up to the top. */}
        {nearTop && (
          <div key={carouselState === 'full-visible' ? 'si-in' : 'si-pending'} className="scroll-indicator flex flex-col items-center mt-4">
            <div className="scroll-indicator-mouse">
              <span className="scroll-indicator-dot" />
            </div>
            <div className="scroll-indicator-chevron">
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1l5 4.5L11 1" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
