"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useScrollGrayscale } from "@/hooks/useScrollGrayscale";

// One accent per row — shared by the pillar index (left) and the stat number +
// card gradient (right). Card 5 carries almost no color, per the design.
const ACCENTS = ["#B23495", "#8665A7", "#32C6CC", "#5D94B9", "#595C5C"];

// Each card owns its background photo independently (no shared/sliced image).
// Same shoot, different crop per card so each card stands on its own.
const CARD_IMAGES = [
  { src: "/images/impact_metrics_background.jpg", position: "center 12%" },
  { src: "/images/impact_metrics_background.jpg", position: "center 35%" },
  { src: "/images/impact_metrics_background.jpg", position: "center 55%" },
  { src: "/images/impact_metrics_background.jpg", position: "center 78%" },
  { src: "/images/impact_metrics_background.jpg", position: "center 95%" },
];

// Left edges stagger slightly per row (row 1 leftmost, row 2 deepest indent),
// while every card runs off the right viewport edge.
const ROW_LEFT_OFFSETS = ["lg:ml-0", "lg:ml-9", "lg:ml-6", "lg:ml-1", "lg:ml-2"];

const ROWS = [
  {
    num: "01",
    title: "Storytelling for justice",
    desc: "We reclaim narratives to expose injustice and shift power.",
    stat: { value: "47", label: "Countries reached", labelColor: "#595C5C" },
  },
  {
    num: "02",
    title: "Learning to organise",
    desc: "We equip people to unlearn, organise, and build collective power.",
    stat: { value: "8,200", label: "Academy participants", labelColor: "#595C5C" },
  },
  {
    num: "03",
    title: "Movement support",
    desc: "We co-create strategy with frontline and grassroots movements.",
    stat: { value: "23", label: "Festival selections", labelColor: "#9D9C9C" },
  },
  {
    num: "04",
    title: "Care as practice",
    desc: "We make care a political commitment and a daily structure.",
    stat: { value: "€2.4M", label: "Redistributed", labelColor: "#595C5C" },
  },
  {
    num: "05",
    title: "Action and amplification",
    desc: "We spark action, deepen connection, and amplify resistance.",
    stat: null, // 5th card is the note card
  },
];

function tint(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** One independent, self-contained stat card: photo → 82% black overlay →
 *  left-anchored color gradient → content. Nothing shared between cards. */
function StatCard({
  accent,
  image,
  colorAmount,
  children,
  className = "",
}: {
  accent: string;
  image: { src: string; position: string };
  colorAmount: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[6px] lg:rounded-r-none border lg:border-r-0 border-white/[0.08] min-h-[68px] flex items-center ${className}`}
    >
      {/* 1 — photograph, texture only: covered, slightly zoomed, desaturated, darkened */}
      <div
        className="absolute inset-0 transition-[filter] duration-700 ease-out"
        style={{
          backgroundImage: `url(${image.src})`,
          backgroundSize: "cover",
          backgroundPosition: image.position,
          transform: "scale(1.06)",
          filter: `saturate(0.7) brightness(0.75) grayscale(${1 - colorAmount})`,
        }}
      />
      {/* 2 — heavy black overlay so the number always wins over the photo */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.82)" }} />
      {/* 3 — colored tint: strong at the left, gone by ~70% across */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(90deg, ${tint(accent, 0.34)} 0%, ${tint(accent, 0.12)} 38%, transparent 70%)` }}
      />
      {/* 4 — content */}
      <div className="relative w-full px-5 sm:px-6 py-4">{children}</div>
    </div>
  );
}

export default function Impact() {
  const sectionRef = useReveal();
  const { ref: photoRef, colorAmount } = useScrollGrayscale<HTMLDivElement>();

  return (
    <section id="about" className="py-20 sm:py-24 lg:py-32 overflow-hidden bg-[#0D0D0D]" ref={sectionRef}>
      {/* Header — label, heading, report button */}
      <div className="reveal px-5 sm:px-8 max-w-[1400px] mx-auto">
        <p className="text-[11px] tracking-[0.25em] uppercase mb-5" style={{ color: "#363636" }}>
          Impact
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h2 className="text-[28px] sm:text-[32px] md:text-[38px] leading-[1.15] md:leading-[40px] tracking-[-1.5px] font-semibold max-w-2xl text-white">
            Impact is not a dashboard.
            <br />
            It is the line between the work
            <br />
            and what it sets in motion.
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13px] border border-white/15 rounded-[3px] px-4 py-2 text-white/40 hover:text-white/60 transition-colors duration-500 self-start md:self-auto md:mb-1"
          >
            Full impact report
            <Image src="/ic_arrow_impact_report.svg" alt="" width={8} height={8} className="w-2 h-2" unoptimized />
          </a>
        </div>
      </div>

      {/* Rows — each pillar (left) is vertically centered against its own card
          (right), so the two columns share one strict rhythm. */}
      <div className="mt-16 sm:mt-20 lg:mt-24 space-y-10 lg:space-y-9" ref={photoRef}>
        {ROWS.map((row, i) => (
          <div key={row.num} className={`reveal stagger-${i + 1} flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-0`}>
            {/* Left: index · divider · title + description */}
            <div className="lg:w-5/12 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))] lg:pr-10">
              <div className="flex gap-6 items-center">
                <span className="text-[11px] leading-[24px] font-semibold" style={{ color: ACCENTS[i] }}>
                  {row.num}
                </span>
                <div className="border-l border-white/[0.08] pl-6">
                  <h4 className="text-white/90 text-[15px] font-medium">{row.title}</h4>
                  <p className="font-[family-name:var(--font-source-sans)] text-[14px] mt-1.5 leading-[20px] line-clamp-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {row.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: the row's own independent card */}
            <div className="lg:w-7/12 px-5 sm:px-8 lg:pr-0 lg:pl-6">
              <StatCard accent={ACCENTS[i]} image={CARD_IMAGES[i]} colorAmount={colorAmount} className={ROW_LEFT_OFFSETS[i]}>
                {row.stat ? (
                  <div className="flex items-baseline gap-4">
                    <span className="text-[26px] sm:text-[30px] font-bold leading-none" style={{ color: ACCENTS[i] }}>
                      {row.stat.value}
                    </span>
                    <span className="text-[13px]" style={{ color: row.stat.labelColor }}>
                      {row.stat.label}
                    </span>
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: "#F0F0F0" }}>
                    Numbers appear alongside the story behind them, never alone.
                  </p>
                )}
              </StatCard>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
