"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const sectionRef = useReveal();

  return (
    <section className="relative py-24 overflow-hidden" ref={sectionRef}>
      {/* Background image */}
      <img
        src="/images/impact_metrics_background.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D]/85 to-[#0D0D0D]" />

      <div className="relative max-w-xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="reveal text-2xl sm:text-3xl md:text-4xl font-bold">
          Don&apos;t look away.
        </h2>
        <p className="reveal stagger-1 text-gray-400 mt-4 leading-relaxed">
          One email when something matters — a new film, a piece, a screening, an open call.
          <br />
          Work that names what power tries to hide. No noise.
        </p>

        {/* Email input */}
        <div className="reveal stagger-2 mt-8 space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 rounded-lg bg-[#1A1A1A] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
          />
          <button className="w-full py-3.5 rounded-lg gradient-fill-btn text-sm text-white font-medium flex items-center justify-center gap-2">
            Subscribe our newsletter
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </button>
        </div>

        <p className="reveal stagger-3 text-xs text-gray-600 mt-4">
          I agree to receive emails from DSH. We don&apos;t share your data.
        </p>
      </div>
    </section>
  );
}
