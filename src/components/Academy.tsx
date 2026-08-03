"use client";

import Link from "next/link";
import ScrollColorImage from "./ScrollColorImage";
import CurtainReveal from "./CurtainReveal";

export default function Academy() {
  return (
    <section id="academy" className="py-10 sm:py-12 lg:py-16">
      <CurtainReveal
        image={
          <ScrollColorImage
            src="/images/political-education.jpg"
            alt="Academy — political education"
            className="aspect-[9/2] md:rounded-tr-[6px] md:rounded-br-[6px]"
          />
        }
      >
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          Academy
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.57517 12.3301L2.95169 10.8807C2.60805 10.7432 2.60805 10.2568 2.95169 10.1193L11.2572 6.79711C11.734 6.60638 12.266 6.60638 12.7428 6.79711L21.0483 10.1193C21.392 10.2568 21.392 10.7432 21.0483 10.8807L17.4248 12.3301" stroke="#32C6CC" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 13.5C14 13.7761 14.2239 14 14.5 14C14.7761 14 15 13.7761 15 13.5H14.5H14ZM14.5 7.5H14V13.5H14.5H15V7.5H14.5Z" fill="#32C6CC"/>
            <path d="M6.5 12.5V16.5L12 18.5L17.5 16.5V12.5C17.5 12.5 17 10.5 12 10.5C7 10.5 6.5 12.5 6.5 12.5Z" stroke="#32C6CC" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h3>
        <p className="text-xs sm:text-sm text-dsh-desc mt-2 sm:mt-3 md:mt-4 leading-relaxed max-w-lg line-clamp-3">
          Political education built as infrastructure — a digital school, a
          living archive, and a space for collective learning. We share
          frameworks, tools, and resources to turn ideas into organised
          action. Free by principle.
        </p>
        <Link href="/academy" className="mt-3 sm:mt-4 md:mt-6 inline-block text-xs sm:text-sm border border-white/15 rounded-[3px] px-4 sm:px-6 py-2 sm:py-2.5 text-[#F0F0F0]/40 hover:text-[#F0F0F0]/60 hover:border-white/25 transition-colors">
          Explore Academy <span className="text-[#32C6CC]">+</span>
        </Link>
      </CurtainReveal>
    </section>
  );
}
