"use client";

import { useReveal } from "@/hooks/useReveal";

const SUPPORT_PILLARS = [
  {
    num: "01",
    title: "Production",
    desc: "Getting films, journalism, and studio work made and finished.",
    color: "#B23495",
  },
  {
    num: "02",
    title: "Free education",
    desc: "Keeping the Academy free and open.",
    color: "#32C6CC",
  },
  {
    num: "03",
    title: "Redistribution",
    desc: "Direct support to the communities the work comes from.",
    color: "#595C5C",
  },
];

export default function SupportCTA() {
  const sectionRef = useReveal();

  return (
    <section id="support" className="relative py-10 sm:py-12 lg:py-16" ref={sectionRef}>
      {/* Full-section background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/support.jpg"
          alt=""
          className="w-full h-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[#0D0D0D]/70" />
      </div>

      <div className="relative px-5 sm:px-8 max-w-[1400px] mx-auto">
        {/* Header row */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-10 sm:mb-16">
          {/* Left: text */}
          <div className="reveal-left md:w-1/2">
            <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-4">
              Support
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-[#FFFFFF]">
              Not pity — solidarity.
              <br />
              Lorem ipsum new line please.
            </h2>
            <p className="text-sm text-[#595C5C] mt-6 leading-relaxed max-w-lg">
              Independent political film, journalism, and education don&apos;t pay for
              themselves, and we don&apos;t want them owned by those who could.
              Support keeps the work free of editorial strings: it funds production,
              keeps the Academy free, and feeds direct redistribution to the
              communities our work comes from.
            </p>
          </div>

          {/* Right: numbered pillars */}
          <div className="reveal-right md:w-1/2 space-y-8 md:pt-12">
            {SUPPORT_PILLARS.map((p, i) => (
              <div key={p.num} className={`reveal stagger-${i + 1} flex gap-6 items-start`}>
                <span className="text-xs font-mono mt-1" style={{ color: p.color }}>{p.num}</span>
                <div>
                  <h4 className="text-[#FFFFFF] font-medium">{p.title}</h4>
                  <p className="text-sm text-[#595C5C] mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two CTA cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Give monthly */}
          <div className="reveal-scale stagger-1 rounded-[6px] bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/5 p-8">
            <p className="text-xs tracking-[0.2em] text-[#FFFFFF59] uppercase mb-2">
              Recurring
            </p>
            <h3 className="text-2xl font-semibold text-[#FFFFFF]">Give monthly</h3>
            <p className="text-sm text-[#FFFFFF73] mt-2">
              Ongoing solidarity. The most useful kind.
            </p>
            <button className="mt-6 w-full py-3 rounded-[3px] gradient-fill-btn text-sm text-[#F0F0F0] font-medium flex items-center justify-center gap-2">
              Give monthly ♡
            </button>
          </div>

          {/* Support the work */}
          <div className="reveal-scale stagger-2 rounded-[6px] bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/5 p-8">
            <p className="text-xs tracking-[0.2em] text-[#FFFFFF40] uppercase mb-2">
              One-time
            </p>
            <h3 className="text-2xl font-semibold text-[#FFFFFF]">Support the work</h3>
            <p className="text-sm text-[#595C5C] mt-2">
              A single contribution, any amount.
            </p>
            <button className="mt-6 w-full py-3 rounded-[3px] border border-dsh-text-primary/20 text-sm text-[#F0F0F0] font-medium flex items-center justify-center gap-2 hover:bg-dsh-btn-bg/20 transition-colors">
              Support our work ♡
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
