"use client";

import { useReveal } from "@/hooks/useReveal";

const PILLARS = [
  {
    num: "01",
    title: "Storytelling for justice",
    desc: "We reclaim narratives to expose injustice and shift power.",
    color: "text-[#9B59B6]",
  },
  {
    num: "02",
    title: "Learning to organise",
    desc: "We equip people to unlearn, organise, and build collective power.",
    color: "text-[#1ABC9C]",
  },
  {
    num: "03",
    title: "Movement support",
    desc: "We co-create strategy with frontline and grassroots movements.",
    color: "text-[#3498DB]",
  },
  {
    num: "04",
    title: "Care as practice",
    desc: "We make care a political commitment and a daily structure.",
    color: "text-[#E67E22]",
  },
  {
    num: "05",
    title: "Action and amplification",
    desc: "We spark action, deepen connection, and amplify resistance.",
    color: "text-[#1ABC9C]",
  },
];

const STATS = [
  { value: "47", label: "Countries reached", color: "text-[#9B59B6]" },
  { value: "8,200", label: "Academy participants", color: "text-[#1ABC9C]" },
  { value: "23", label: "Festival selections", color: "text-[#3498DB]" },
  { value: "€2.4M", label: "Redistributed", color: "text-[#E67E22]" },
];

export default function Impact() {
  const sectionRef = useReveal();

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 overflow-hidden" ref={sectionRef}>
      {/* Header — contained */}
      <div className="reveal mb-6 px-5 sm:px-8 max-w-[1400px] mx-auto">
        <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-4">
          Impact
        </p>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight max-w-xl text-dsh-text-primary">
            Impact is not a dashboard.
            <br />
            It is the line between the work
            <br />
            and what it sets in motion.
          </h2>
          <a
            href="#"
            className="text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors self-start"
          >
            Full impact report <span className="text-[#1ABC9C]">↗</span>
          </a>
        </div>
      </div>

      {/* Two-column: pillars (contained) + stats (bleed right) */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 mt-10 sm:mt-16">
        {/* Left: numbered pillars — stays in container */}
        <div className="lg:w-5/12 space-y-8 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          {PILLARS.map((p, i) => (
            <div key={p.num} className={`reveal stagger-${i + 1} flex gap-6 items-start`}>
              <span className={`text-xs font-mono ${p.color} mt-1`}>{p.num}</span>
              <div className="border-l border-white/10 pl-6">
                <h4 className="text-dsh-text-primary font-medium">{p.title}</h4>
                <p className="text-sm text-dsh-desc mt-1">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: stats cards — bleed to the right edge */}
        <div className="lg:w-7/12 space-y-3 px-5 sm:px-8 lg:pr-0 lg:pl-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`stat-reveal stagger-${i + 1} relative bg-[#1A1A1A]/60 border-l border-white/5 p-5 sm:p-6 overflow-hidden lg:rounded-l-[6px]`}
            >
              {/* Gradient bleed to right edge */}
              <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#1a1a2e]/30 to-[#2a1a2e]/20" />
              <div className="relative flex items-baseline gap-3">
                <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-sm text-dsh-desc">{stat.label}</span>
              </div>
            </div>
          ))}

          {/* Bottom note card */}
          <div className="reveal stagger-5 bg-[#1A1A1A]/60 border-l border-white/5 p-5 sm:p-6 lg:rounded-l-[6px]">
            <p className="text-sm text-dsh-desc">
              Numbers appear alongside the story behind them, never alone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
