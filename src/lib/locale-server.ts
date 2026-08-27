import { headers } from "next/headers";
import { getLocales, getDefaultLocale, type Locale } from "./i18n";

/**
 * The locale for the current request, resolved on the server.
 *
 * The middleware puts the URL prefix in `x-locale`; an empty value means the
 * unprefixed default. Everything is validated against the enabled list, so a
 * hand-typed `/xx/studio` falls back to the default rather than rendering a
 * page with no content.
 */
export async function getRequestLocale(): Promise<{
  locale: Locale;
  defaultLocale: Locale;
  locales: Locale[];
  /** Path without the locale prefix, for building switcher links. */
  pathname: string;
}> {
  const h = await headers();
  const asked = h.get("x-locale") || "";
  const pathname = h.get("x-pathname") || "/";

  const locales = await getLocales();
  const defaultLocale = await getDefaultLocale();
  const locale = locales.find((l) => l.code === asked) ?? defaultLocale;

  return { locale, defaultLocale, locales, pathname };
}
