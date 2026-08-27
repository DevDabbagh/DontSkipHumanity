"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The request's locale, handed down from the server layout.
 *
 * Client components (the navbar, the switcher) cannot call `headers()`, and
 * fetching the language list again from the browser would mean a second
 * round-trip for something the server already resolved. The layout reads it
 * once and passes it through here.
 */

export interface LocaleInfo {
  code: string;
  label: string;
  nativeName?: string;
  flag?: string;
  isDefault: boolean;
  direction: "ltr" | "rtl";
}

interface LocaleValue {
  locale: LocaleInfo;
  locales: LocaleInfo[];
  defaultCode: string;
  /** Path without the locale prefix, for building switcher links. */
  pathname: string;
  /**
   * Interface strings already resolved to this locale — nav labels, buttons,
   * footer headings. Flattened on the server so a client component doesn't
   * re-do the fallback chain on every render.
   */
  strings: Record<string, string>;
}

const FALLBACK: LocaleValue = {
  locale: { code: "en", label: "English", isDefault: true, direction: "ltr" },
  locales: [{ code: "en", label: "English", isDefault: true, direction: "ltr" }],
  defaultCode: "en",
  pathname: "/",
  strings: {},
};

const Ctx = createContext<LocaleValue>(FALLBACK);

export function LocaleProvider({
  value,
  children,
}: {
  value: LocaleValue;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}

/**
 * The current path with the locale prefix removed — `/ar/films` → `/films`.
 *
 * Read live from the router, NOT from the `pathname` the server layout passes
 * down. Next reuses the shared root layout across client-side navigations
 * instead of re-rendering it, so the server value freezes at whichever page was
 * first loaded — which left the navbar highlighting Studio on every page after
 * a visitor arrived at /studio. Anything that has to track the current page
 * belongs here; the context's `pathname` is only a first-paint seed.
 */
export function useCurrentPath() {
  const { locale, defaultCode } = useLocale();
  const path = usePathname() || "/";
  if (locale.code === defaultCode) return path;
  const prefix = `/${locale.code}`;
  if (path === prefix) return "/";
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
}

/**
 * `t("nav.studio")` in a client component.
 *
 * Falls back to the key itself, so a string that was never seeded shows up in
 * the page as `nav.studio` — noticeable, rather than a blank button.
 */
export function useT() {
  const { strings } = useLocale();
  return (key: string) => strings[key] || key;
}

/**
 * Prefix a path with the current locale.
 *
 * Every in-site link has to go through this, otherwise clicking "Studio" from
 * `/ar/films` would drop the reader back into the default language.
 */
export function useLocaleHref() {
  const { locale, defaultCode } = useLocale();
  return (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (locale.code === defaultCode) return clean;
    return `/${locale.code}${clean === "/" ? "" : clean}`;
  };
}
