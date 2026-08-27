import { supabase } from "./supabase";

/**
 * Locales for the public site.
 *
 * The list is the same row the dashboard edits (`site_settings.content_languages`),
 * so adding a language in Settings makes it appear here — no deploy, and no
 * second list to keep in sync. It used to live in the dashboard's localStorage,
 * which is why the site had no switcher: it genuinely could not see them.
 *
 * URL shape: the default locale has no prefix (`/studio`), every other locale
 * is prefixed (`/ar/studio`). Prefixing the default too would break every
 * existing link and duplicate each page under two URLs for search engines.
 */

export interface Locale {
  code: string;
  label: string;
  nativeName?: string;
  flag?: string;
  enabled: boolean;
  isDefault: boolean;
  direction: "ltr" | "rtl";
}

/** Used before the DB answers, and if the row is missing entirely. */
export const FALLBACK_LOCALES: Locale[] = [
  { code: "en", label: "English", nativeName: "English", flag: "🇬🇧", enabled: true, isDefault: true, direction: "ltr" },
];

let cache: { at: number; locales: Locale[] } | null = null;
const TTL_MS = 60_000;

export async function getLocales(): Promise<Locale[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.locales;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "content_languages")
      .single();
    if (error || !data?.value) return FALLBACK_LOCALES;

    const raw = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    if (!Array.isArray(raw) || raw.length === 0) return FALLBACK_LOCALES;

    const locales: Locale[] = raw
      .filter((l) => l?.code && l?.enabled)
      .map((l) => ({
        code: String(l.code),
        label: String(l.label || l.code),
        nativeName: l.nativeName ? String(l.nativeName) : undefined,
        flag: l.flag ? String(l.flag) : undefined,
        enabled: true,
        isDefault: Boolean(l.isDefault),
        direction: l.direction === "rtl" ? "rtl" : "ltr",
      }));

    if (locales.length === 0) return FALLBACK_LOCALES;
    /* Exactly one default, always — otherwise the fallback chain has no floor. */
    if (!locales.some((l) => l.isDefault)) locales[0].isDefault = true;

    cache = { at: Date.now(), locales };
    return locales;
  } catch {
    return FALLBACK_LOCALES;
  }
}

export async function getDefaultLocale(): Promise<Locale> {
  const all = await getLocales();
  return all.find((l) => l.isDefault) ?? all[0];
}

/**
 * Read one translated field.
 *
 * Order: the asked-for locale → the default locale → any other language that
 * has text → empty. The middle step is the decision Ahmed made: a visitor
 * reading Arabic sees the English rather than a blank page while translation
 * is still in progress.
 *
 * Accepts a bare string too, because rows written before translations existed
 * hold one, and both shapes will coexist for a long time.
 */
export function pickLang(
  value: unknown,
  locale: string,
  defaultLocale = "en"
): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";

  const map = value as Record<string, string>;
  const asked = map[locale]?.trim();
  if (asked) return asked;

  const fallback = map[defaultLocale]?.trim();
  if (fallback) return fallback;

  return Object.values(map).find((v) => v?.trim()) ?? "";
}

/** Prefix a path for a locale. The default locale stays unprefixed. */
export function localeHref(path: string, locale: string, defaultCode: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultCode) return clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}
