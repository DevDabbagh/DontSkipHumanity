import { NextResponse } from "next/server";
import { getFilmBySlug, getStudioProjectBySlug, getProgramBySlug } from "@/lib/api";

export const runtime = "nodejs";

/**
 * The public face of one film / studio project / academy program, reduced to
 * what a card needs: a picture, a sub-line, and where it lives.
 *
 * This exists because `lib/api.ts` reaches `next/headers` (to pick the
 * locale), which makes it server-only — a client component that imports it
 * fails the build outright. The support page is a client component and needs
 * the poster of the project someone arrived to fund, so the lookup happens
 * here and the page fetches it.
 *
 * Going through `lib/api.ts` rather than straight to Supabase means this
 * follows each module's own mock/live switch, so nothing extra has to be
 * remembered when Films is flipped to live.
 *
 * Everything returned is already public on the project's own page. No
 * unpublished record is reachable: `lib/api.ts` filters to published content,
 * and an unknown slug returns 404 rather than an empty shell.
 */

type Payload = {
  title: string;
  image: string | null;
  meta: string | null;
  href: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = (searchParams.get("slug") ?? "").trim().slice(0, 120);

  if (!slug || (type !== "film" && type !== "studio" && type !== "academy")) {
    return NextResponse.json({ error: "Unknown project." }, { status: 400 });
  }

  const join = (parts: (string | undefined | null)[]) =>
    parts.filter(Boolean).join(" · ") || null;

  try {
    let payload: Payload | null = null;

    if (type === "film") {
      const f = await getFilmBySlug(slug);
      if (f) {
        payload = {
          title: f.title,
          image: f.posterUrl || f.thumbnailUrl || null,
          meta: join([f.credits?.year, f.credits?.duration, f.stage?.replace(/_/g, " ")]),
          href: `/film/${slug}`,
        };
      }
    } else if (type === "studio") {
      const s = await getStudioProjectBySlug(slug);
      if (s) {
        payload = {
          title: s.title,
          image: s.coverUrl || s.thumbnailUrl || null,
          meta: join([s.format, s.status]),
          href: `/studio/${slug}`,
        };
      }
    } else {
      const p = await getProgramBySlug(slug);
      if (p) {
        payload = {
          title: p.title,
          image: p.thumbnailUrl || null,
          meta: join([p.type, p.duration]),
          href: `/academy/${slug}`,
        };
      }
    }

    if (!payload) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api/project]", err);
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
}
