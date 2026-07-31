"use client";

import { useReveal } from "@/hooks/useReveal";
import { useScrollGrayscale } from "@/hooks/useScrollGrayscale";

// One accent color per row — shared between the pillar's number (left column)
// and that row's stat number (right column), per the Figma spec.
const ACCENTS = ["#B23495", "#8665A7", "#32C6CC", "#5D94B9", "#595C5C"];

const PILLARS = [
  {
    num: "01",
    title: "Storytelling for justice",
    desc: "We reclaim narratives to expose injustice and shift power.",
  },
  {
    num: "02",
    title: "Learning to organise",
    desc: "We equip people to unlearn, organise, and build collective power.",
  },
  {
    num: "03",
    title: "Movement support",
    desc: "We co-create strategy with frontline and grassroots movements.",
  },
  {
    num: "04",
    title: "Care as practice",
    desc: "We make care a political commitment and a daily structure.",
  },
  {
    num: "05",
    title: "Action and amplification",
    desc: "We spark action, deepen connection, and amplify resistance.",
  },
];

const STATS = [
  { value: "47", label: "Countries reached", labelColor: "#595C5C" },
  { value: "8,200", label: "Academy participants", labelColor: "#595C5C" },
  { value: "23", label: "Festival selections", labelColor: "#9D9C9C" },
  { value: "€2.4M", label: "Redistributed", labelColor: "#595C5C" },
];

// hex + 0-1 alpha -> rgba(), so each card can tint the shared background image
// with its own row accent without needing a Tailwind class per hex value.
function tint(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Row 0 ("47 · Countries reached") bleeds all the way to the viewport edge;
// rows 1–4 are held back with a visible right edge, per the Figma reference —
// the cards don't all end at the same place.
function rowWidthClasses(i: number) {
  return i === 0 ? "lg:rounded-r-none lg:border-r-0" : "lg:mr-10 xl:mr-20 lg:rounded-r-[6px] lg:border-r";
}

function BackgroundSlice({ position, colorAmount }: { position: string; colorAmount: number }) {
  return (
    <>
      {/* Shared photo — one continuous image sliced by row via background-position,
          held black & white until scrolled into view, then gains color. */}
      <div
        className="absolute inset-0 hidden lg:block transition-[filter] duration-100 ease-out"
        style={{
          backgroundImage: "url(/images/impact_metrics_background.jpg)",
          backgroundSize: "100% 500%",
          backgroundPosition: position,
          opacity: 0.7,
          filter: `grayscale(${1 - colorAmount})`,
        }}
      />
      {/* Black shadow, strong on the left (behind the text) fading out to the
          right, so the numbers stay legible over a busy photo. */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 32%, rgba(0,0,0,0.1) 60%, transparent 85%)" }}
      />
    </>
  );
}

export default function Impact() {
  const sectionRef = useReveal();
  const { ref: photoRef, colorAmount } = useScrollGrayscale<HTMLDivElement>();

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 overflow-hidden" ref={sectionRef}>
      {/* Header — contained */}
      <div className="reveal mb-6 px-5 sm:px-8 max-w-[1400px] mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: "#363636" }}>
          Impact
        </p>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight max-w-xl text-white">
            Impact is not a dashboard.
            <br />
            It is the line between the work
            <br />
            and what it sets in motion.
          </h2>
          <a
            href="#"
            className="text-sm border border-white/20 rounded-[3px] px-5 py-2 bg-white/[0.03] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors self-start"
          >
            Full impact report <span className="text-[#1ABC9C]">↗</span>
          </a>
        </div>
      </div>

      {/* Two-column: pillars (contained) + stats (bleed to the right edge, one
          shared background image split across the 5 rows) */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 mt-10 sm:mt-16" ref={photoRef}>
        {/* Left: numbered pillars — stays in container */}
        <div className="lg:w-5/12 space-y-8 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          {PILLARS.map((p, i) => (
            <div key={p.num} className={`reveal stagger-${i + 1} flex gap-6 items-start`}>
              <span className="text-xs font-mono mt-1" style={{ color: ACCENTS[i] }}>
                {p.num}
              </span>
              <div className="border-l border-white/10 pl-6">
                <h4 className="text-white font-medium">{p.title}</h4>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: stats cards */}
        <div className="lg:w-7/12 space-y-3 px-5 sm:px-8 lg:pr-0 lg:pl-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`stat-reveal stagger-${i + 1} relative overflow-hidden lg:rounded-l-[6px] border-l min-h-[92px] sm:min-h-[104px] flex items-center ${rowWidthClasses(i)}`}
              style={{ borderColor: tint(ACCENTS[i], 0.35) }}
            >
              <BackgroundSlice position={`center ${i * 25}%`} colorAmount={colorAmount} />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, ${tint(ACCENTS[i], 0.3)}, transparent 55%)` }}
              />
              <div className="relative p-5 sm:p-6 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: ACCENTS[i] }}>
                  {stat.value}
                </span>
                <span className="text-sm" style={{ color: stat.labelColor }}>
                  {stat.label}
                </span>
              </div>
            </div>
          ))}

          {/* Bottom note card — 5th slice of the same image */}
          <div
            className={`reveal stagger-5 relative overflow-hidden lg:rounded-l-[6px] border-l min-h-[92px] sm:min-h-[104px] flex items-center p-5 sm:p-6 ${rowWidthClasses(4)}`}
            style={{ borderColor: tint(ACCENTS[4], 0.35) }}
          >
            <BackgroundSlice position="center 100%" colorAmount={colorAmount} />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(90deg, ${tint(ACCENTS[4], 0.3)}, transparent 55%)` }}
            />
            <p className="relative text-sm" style={{ color: "#F0F0F0" }}>
              Numbers appear alongside the story behind them, never alone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
