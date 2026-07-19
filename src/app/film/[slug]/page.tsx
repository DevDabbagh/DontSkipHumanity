import { notFound } from "next/navigation";
import { getFilmBySlug, MOCK_FILMS } from "@/lib/mock-data";
import FilmContent from "./FilmContent";

// Generate static params for all films
export function generateStaticParams() {
  return MOCK_FILMS.filter((f) => f.status === "published").map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) return { title: "Film Not Found — DSH" };
  return {
    title: `${film.title} — Don't Skip Humanity`,
    description: film.synopsisShort,
  };
}

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) notFound();

  // Get related films (same themes, excluding current)
  const relatedFilms = MOCK_FILMS
    .filter((f) => f.slug !== film.slug && f.status === "published")
    .filter((f) => f.themes.some((t) => film.themes.includes(t)))
    .slice(0, 3);

  return <FilmContent film={film} relatedFilms={relatedFilms} />;
}
