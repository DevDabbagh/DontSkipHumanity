"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function Academy() {
  const sectionRef = useReveal();

  return (
    <section id="academy" className="py-12 sm:py-16 lg:py-20" ref={sectionRef}>
      <div className="px-5 sm:px-8 max-w-[1400px] mx-auto">
        {/* Academy — image left, text right (matching Films/Studio alternating pattern) */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-start">
          <div className="reveal-left stagger-1 md:w-1/2">
            <ScrollColorImage
              src="/images/political-education.jpg"
              alt="Academy — political education"
              className="aspect-[4/3] rounded-lg"
            />
          </div>
          <div className="reveal-right stagger-2 md:w-1/2 md:pt-8">
            <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
              Academy
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
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
      </div>
    </section>
  );
}
