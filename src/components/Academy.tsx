"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

const ACADEMY_ITEMS = [
  {
    num: "01",
    title: "Courses & masterclasses",
    desc: "Learn from activists, journalists, and cultural workers on the frontlines.",
  },
  {
    num: "02",
    title: "Toolkits & resources",
    desc: "Practical guides on advocacy, storytelling, and naming systems of power.",
  },
  {
    num: "03",
    title: "Workshops & live trainings",
    desc: "Hands-on sessions to sharpen organising and storytelling skills.",
  },
  {
    num: "04",
    title: "Mentorships & collaborations",
    desc: "Connect with grassroots movements and experienced practitioners.",
  },
];

export default function Academy() {
  const sectionRef = useReveal();

  return (
    <section id="academy" className="py-16 sm:py-20 lg:py-24" ref={sectionRef}>
      <div className="px-5 sm:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
          {/* Left — text + numbered items on clean dark background */}
          <div className="reveal-left lg:w-[45%] lg:pr-16">
            <p className="text-xs tracking-[0.25em] text-gray-500 uppercase mb-4">
              Academy
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
              Knowledge is power.
              <br />
              Education is resistance.
            </h2>

            <p className="text-gray-400 mt-6 leading-relaxed max-w-lg">
              The Academy is political education built as infrastructure — a digital
              school, a living archive, and a space for collective learning. Not a film
              school, not a training agency. We share the frameworks, tools, and
              resources to turn ideas into organised action.
            </p>

            <p className="text-[#1ABC9C] text-sm mt-4">Free by principle</p>

            {/* Numbered items — plain text, no cards */}
            <div className="mt-10 space-y-8">
              {ACADEMY_ITEMS.map((item, i) => (
                <div key={item.num} className={`reveal stagger-${i + 1}`}>
                  <span className="text-xs text-[#1ABC9C] font-mono">{item.num}</span>
                  <h4 className="text-white font-medium mt-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="reveal stagger-5 flex items-center gap-4 mt-10">
              <Link href="/academy" className="text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
                Enter the Academy +
              </Link>
              <Link href="/course/community-screening-toolkit" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                Browse resources
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right — background image only, no overlay cards */}
          <div className="reveal-right lg:w-[55%] relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <img
                src="/images/political-education.jpg"
                alt=""
                className="w-full h-full object-cover opacity-[0.35]"
              />
              <div className="absolute inset-0 bg-[#0D0D0D]/40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
