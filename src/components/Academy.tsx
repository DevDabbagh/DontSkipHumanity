"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function Academy() {
  const sectionRef = useReveal();

  return (
    <section id="academy" className="py-12 sm:py-16 lg:py-20" ref={sectionRef}>
      {/* Academy — same full-bleed pattern as Films: image bleeds left, text right */}
      <div className="flex flex-col md:flex-row items-center">
        <div className="reveal-left stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <ScrollColorImage
            src="/images/political-education.jpg"
            alt="Academy — political education"
            className="aspect-[9/2] max-md:rounded-lg md:rounded-tr-[6px] md:rounded-br-[6px]"
          />
        </div>
        <div className="reveal-right stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pl-14 md:pr-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Academy
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.57517 12.3301L2.95169 10.8807C2.60805 10.7432 2.60805 10.2568 2.95169 10.1193L11.2572 6.79711C11.734 6.60638 12.266 6.60638 12.7428 6.79711L21.0483 10.1193C21.392 10.2568 21.392 10.7432 21.0483 10.8807L17.4248 12.3301" stroke="#32C6CC" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 13.5C14 13.7761 14.2239 14 14.5 14C14.7761 14 15 13.7761 15 13.5H14.5H14ZM14.5 7.5H14V13.5H14.5H15V7.5H14.5Z" fill="#32C6CC"/>
              <path d="M6.5 12.5V16.5L12 18.5L17.5 16.5V12.5C17.5 12.5 17 10.5 12 10.5C7 10.5 6.5 12.5 6.5 12.5Z" stroke="#32C6CC" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
            Political education built as infrastructure — a digital school, a
            living archive, and a space for collective learning. We share
            frameworks, tools, and resources to turn ideas into organised
            action. Free by principle.
          </p>
          <Link href="/academy" className="mt-6 inline-block text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Enter the Academy +
          </Link>
        </div>
      </div>
    </section>
  );
}
