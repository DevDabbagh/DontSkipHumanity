import { supabase } from "@/lib/supabase";
import { FALLBACK_FILM_FORMS, type FilmFormOption } from "@/lib/film-forms";

/**
 * Fetching the film forms, kept apart from resolving them.
 *
 * The resolvers in `film-forms.ts` are imported by `FilmsListing`, which is a
 * client component. Putting this `supabase` import in that file would send the
 * client into the browser bundle for every visitor to the films page, to
 * resolve two strings that were already resolved on the server. Same split,
 * same reason, as `header-mosaic` beside `landing`.
 */

let cache: { at: number; forms: FilmFormOption[] } | null = null;
const TTL_MS = 60_000;

/**
 * Cached for a minute, matching `getLocales`.
 *
 * Every card on the listing needs a label and a colour; without the cache a
 * page of thirty films is thirty identical queries for one settings row.
 */
export async function getFilmForms(): Promise<FilmFormOption[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.forms;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "film_categories")
      .single();

    if (error || !data?.value) return FALLBACK_FILM_FORMS;

    const raw = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    if (!Array.isArray(raw) || raw.length === 0) return FALLBACK_FILM_FORMS;

    const forms: FilmFormOption[] = raw
      .filter((c) => c?.id)
      .map((c) => ({
        slug: String(c.id),
        label: String(c.name ?? c.id),
        labelI18n: c.nameI18n && typeof c.nameI18n === "object" ? c.nameI18n : undefined,
        color: String(c.color || "#B23495"),
        opacity: typeof c.opacity === "number" ? c.opacity : 100,
      }));

    if (forms.length === 0) return FALLBACK_FILM_FORMS;

    cache = { at: Date.now(), forms };
    return forms;
  } catch {
    // A settings row that cannot be read must not take the films page with it.
    return FALLBACK_FILM_FORMS;
  }
}
