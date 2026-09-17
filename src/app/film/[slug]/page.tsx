import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getFilmBySlug, getAllFilms } from "@/lib/api";
import { getFilmForms } from "@/lib/film-forms-server";
import { getLocales } from "@/lib/i18n";
import FilmContent from "./FilmContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) return { title: "Film Not Found — DSH" };
  return {
    title: `${film.title} — Don't Skip Humanity`,
    description: film.synopsisShort,
  };
}

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  // Get related films (same themes, excluding current)
  const allFilms = await getAllFilms();
  const relatedFilms = allFilms
    .filter((f) => f.slug !== film.slug)
    .filter((f) => f.themes.some((t) => film.themes.includes(t)))
    .slice(0, 3);

  const [forms, locales] = await Promise.all([getFilmForms(), getLocales()]);
  const defaultLocale = (locales.find((l) => l.isDefault) ?? locales[0])?.code ?? "en";

  return (
    <FilmContent
      film={film}
      relatedFilms={relatedFilms}
      forms={forms}
      locale={defaultLocale}
      defaultLocale={defaultLocale}
    />
  );
}
