"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SupportBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function checkBanner() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "support_banner")
          .single();

        if (!error && data) {
          const raw = typeof data.value === "string" ? data.value : JSON.stringify(data.value);
          const parsed = JSON.parse(raw);
          setVisible(parsed === true || parsed === "true");
        }
      } catch {}
      setLoaded(true);
    }
    checkBanner();
  }, []);

  if (!loaded || !visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300">
      <div className="bg-[#C0392B] text-white">
        {/* Collapse button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          {/* Left — message */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
              Support independent media.
            </span>
            <span className="text-xs sm:text-sm text-white/80">
              We don&apos;t take corporate money. Our work is funded by people who believe stories should serve justice, not profit.
            </span>
          </div>

          {/* Right — CTA */}
          <a
            href="/support"
            className="shrink-0 bg-white text-[#C0392B] text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Fund the work
          </a>
        </div>
      </div>
    </div>
  );
}
