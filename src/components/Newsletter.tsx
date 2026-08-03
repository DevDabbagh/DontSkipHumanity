"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const sectionRef = useReveal();

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden" ref={sectionRef}>
      {/* Background image — ic_newsletter, B&W with shadow */}
      <img
        src="/images/newsletter-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(1) brightness(0.25) contrast(1.1)" }}
      />
      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-[500px] mx-auto px-5 sm:px-8 text-center">
        <h2 className="reveal text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Don&apos;t look away.
        </h2>

        <p className="reveal stagger-1 text-xs sm:text-sm text-[#595C5C] mt-4 sm:mt-5 leading-relaxed">
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
            className="w-full px-4 py-3 rounded-[3px] text-white text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: "rgba(54, 54, 54, 0.30)",
              border: "1px solid rgba(240, 240, 240, 0.20)",
            }}
          />
          <style jsx>{`
            input::placeholder {
              color: #595C5C;
            }
          `}</style>
          <button className="w-full py-3 rounded-[3px] gradient-fill-btn text-sm text-white font-medium flex items-center justify-center gap-2">
            Subscribe our newsletter
            <img src="/images/ic_newsletter_btn.png" alt="" className="w-4 h-4 object-contain" />
          </button>
        </div>

        <p className="reveal stagger-3 text-xs text-[#595C5C] mt-4">
          I agree to receive emails from DSH. We don&apos;t share your data.
        </p>
      </div>
    </section>
  );
}
