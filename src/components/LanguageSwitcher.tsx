"use client";

import { useState } from "react";
import { useT } from "@/contexts/LocaleContext";

/* Inline rather than from an icon package — the landing app doesn't depend on
   lucide (that's the dashboard), and adding it for one glyph isn't worth the
   bundle. */
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/**
 * Language switcher.
 *
 * Navigates to the same page under another locale prefix — `/studio` →
 * `/ar/studio` — so the choice is in the URL and can be shared, bookmarked and
 * indexed. Nothing is stored client-side: the URL is the single source of
 * truth for which language you are reading.
 *
 * Rendered only when more than one language is enabled in the dashboard, so a
 * single-language site shows no dead control.
 */

export interface SwitcherLocale {
  code: string;
  label: string;
  nativeName?: string;
  flag?: string;
  isDefault: boolean;
}

export default function LanguageSwitcher({
  locales,
  current,
  pathname,
  defaultCode,
}: {
  locales: SwitcherLocale[];
  current: string;
  /** Path WITHOUT the locale prefix, e.g. "/studio/yalla". */
  pathname: string;
  defaultCode: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  if (locales.length < 2) return null;

  const active = locales.find((l) => l.code === current) ?? locales[0];

  const hrefFor = (code: string) => {
    const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
    if (code === defaultCode) return clean;
    return `/${code}${clean === "/" ? "" : clean}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        className="flex items-center gap-[6px] text-[13px] font-medium text-[rgba(240,240,240,0.6)] hover:text-[#F0F0F0] transition-colors"
      >
        <GlobeIcon />
        <span className="uppercase">{active.code}</span>
      </button>

      {open && (
        <>
          {/* Click-away layer, so the menu closes without a document listener. */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute end-0 top-full mt-2 z-50 min-w-[160px] rounded-[6px] border border-[rgba(240,240,240,0.1)] bg-[#131313] py-1 shadow-[0px_6px_20px_2px_rgba(0,0,0,0.5)]"
          >
            {locales.map((l) => (
              <li key={l.code}>
                {/* A plain anchor, not next/link: switching language should
                    re-run the server render with the new locale header rather
                    than reuse the client cache for the previous one. */}
                <a
                  href={hrefFor(l.code)}
                  role="option"
                  aria-selected={l.code === current}
                  className={`flex items-center gap-[10px] px-[14px] py-[8px] text-[13px] transition-colors ${
                    l.code === current
                      ? "text-[#8665A7]"
                      : "text-[rgba(240,240,240,0.6)] hover:text-[#F0F0F0]"
                  }`}
                >
                  {l.flag && <span aria-hidden>{l.flag}</span>}
                  <span>{l.nativeName || l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
