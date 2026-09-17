/**
 * The film forms the dashboard edits, on the website.
 *
 * NOTHING IS IMPORTED HERE, ON PURPOSE
 *
 * `FilmsListing` is a client component and imports these resolvers directly.
 * A single value import of Supabase — or of `i18n`, which imports Supabase —
 * would pull the client and its config into the browser bundle for the sake
 * of two string lookups. So the fetch lives in `film-forms-server.ts` and the
 * language fallback below is written out rather than borrowed from `pickLang`.
 *
 * This is the same split `header-mosaic` exists for, and the comment at the
 * top of `FilmsListing` is about.
 *
 * WHAT THIS REPLACES
 *
 * Nine places across three files decided a film's label and colour like this:
 *
 *     film.credits.form === "documentary" ? "Documentary" : "Fiction"
 *     backgroundColor: form === "documentary" ? "#B23495" : "#771D5C"
 *
 * Two branches for a list the dashboard lets an editor extend. Add a third
 * form — Experimental, Hybrid, Essay — and every film carrying it renders as
 * **Fiction**, in Fiction's colour, on the card, on the detail page, in the
 * filter bar. Nothing throws; the page just says something untrue. That is the
 * expensive kind of wrong, because there is nothing to notice.
 *
 * The forms come from `site_settings.film_categories`, the same row the
 * dashboard writes. Deliberately not a second copy of the list here: a copy
 * would be right on the day it was written and wrong from the next edit on.
 *
 * WHY THE FALLBACK IS STILL THE OLD TWO
 *
 * They are what every existing film points at, and a website that renders no
 * label at all while a settings row is briefly unreachable is worse than one
 * that renders the two labels that were true yesterday. It is a floor, not a
 * source of truth — once the row loads, the row wins.
 */

export interface FilmFormOption {
  slug: string;
  label: string;
  /** Per-language names, keyed by code, as `MultiLangField` writes them. */
  labelI18n?: Record<string, string>;
  color: string;
  opacity: number;
}

/** What the site showed before the list was editable. */
export const FALLBACK_FILM_FORMS: FilmFormOption[] = [
  { slug: "documentary", label: "Documentary", color: "#B23495", opacity: 100 },
  { slug: "fiction", label: "Fiction", color: "#771D5C", opacity: 100 },
];

/* ── Resolvers ────────────────────────────────────────────────────── */

/**
 * The asked-for language, then the site default, then any language with text.
 *
 * The same order as `pickLang`, written out here rather than imported — see
 * the note at the top. Ahmed's rule stands: a visitor reading Arabic sees the
 * English rather than a blank chip while translation is still in progress.
 */
function pick(map: Record<string, string> | undefined, locale: string, defaultLocale: string): string {
  if (!map) return "";
  return (
    map[locale]?.trim() ||
    map[defaultLocale]?.trim() ||
    Object.values(map).find((v) => v?.trim())?.trim() ||
    ""
  );
}

/**
 * The label for a stored slug, in the visitor's language.
 *
 * A slug that matches nothing returns the slug itself rather than guessing.
 * That happens when a form is deleted while films still point at it, and the
 * raw value is the honest answer: visibly odd, which is what sends someone to
 * fix the film, instead of silently mislabelling it as Fiction forever.
 */
export function filmFormLabel(
  forms: FilmFormOption[],
  slug: string | undefined,
  locale = "en",
  defaultLocale = "en",
): string {
  if (!slug) return "";
  const found = forms.find((f) => f.slug === slug);
  if (!found) return slug;

  return pick(found.labelI18n, locale, defaultLocale) || found.label || slug;
}

/** The colour the editor picked, or the house pink when the slug is unknown. */
export function filmFormColor(
  forms: FilmFormOption[],
  slug: string | undefined,
  fallback = "#B23495",
): string {
  return forms.find((f) => f.slug === slug)?.color || fallback;
}

/**
 * The same colour at an opacity, for the muted second line beside a label.
 *
 * The old code wrote `rgba(178,52,149,0.6)` by hand next to `#B23495`, so a
 * colour change meant remembering to edit two values that did not look
 * related. This derives the second from the first.
 */
export function filmFormColorAlpha(
  forms: FilmFormOption[],
  slug: string | undefined,
  alpha: number,
  fallback = "#B23495",
): string {
  const hex = filmFormColor(forms, slug, fallback).replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return `rgba(178,52,149,${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
