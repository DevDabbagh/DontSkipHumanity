/**
 * The wall of photographs behind an inner-page header.
 *
 * WHY THIS IS ITS OWN FILE
 *
 * This logic began life in `lib/landing.ts`, which was the obvious home for
 * it — until the three listing components started calling it. They are client
 * components, and they had only ever taken *types* from `landing.ts`; a type
 * import is erased at compile time and never reaches the browser bundle.
 * Importing a function instead pulled the whole module in, and with it
 * `locale-server.ts` and `next/headers`, which cannot run on the client. The
 * build failed on exactly that.
 *
 * `tsc --noEmit` passes on it, because it is not a type error — it is a
 * bundling boundary. So the rule this file exists to keep is simple: nothing
 * in here may import anything server-only, and everything a client component
 * needs to compute a header wall lives here.
 *
 * Reading the settings row, which does need the server, stays in
 * `landing.ts`.
 */

/**
 * Where a header's photographs come from (migration 037).
 *
 *   content  imported from the catalogues named in `sources` — not limited
 *            to the section's own. An Academy header with film posters
 *            behind it is a legitimate choice.
 *   tiles    images uploaded for this header specifically.
 *
 * Absent means `content`, which is what Films has always done.
 */
export type HeaderImageMode = "content" | "tiles";

/** The catalogues a header wall can import posters from. */
export type HeaderSource = "films" | "studio" | "academy";

export interface HeaderImages {
  imageMode?: HeaderImageMode;
  /** Which catalogues `content` mode imports from. */
  sources?: HeaderSource[];
  /** Used when `imageMode` is "tiles". */
  tiles?: string[];
  /** The retired wide-sheet export. Kept on the row, no longer rendered. */
  imageSrc?: string;
}

/** Posters available to a header wall, by catalogue. */
export type HeaderImagePools = Record<HeaderSource, string[]>;

/**
 * The wall is three drifting rows. Below this the same photograph is visible
 * twice at once, which reads as a mistake rather than a pattern.
 */
export const MIN_HEADER_TILES = 8;

/**
 * Resolve the tiles for a section header.
 *
 * One function for Films, Studio and Academy so the three cannot drift again
 * — which they had: Films built its wall from the real stills, Studio showed
 * a Figma export, and Academy showed *Studio's* export because its own was
 * never made and nothing could change it.
 *
 * Uploaded images below MIN_HEADER_TILES are topped up from the catalogue
 * rather than left to repeat visibly. A short list is a warning in the
 * editor, never a broken wall on the page.
 */
export function resolveHeaderTiles(
  header: HeaderImages | undefined,
  pools: HeaderImagePools
): string[] {
  const mode = header?.imageMode === "tiles" ? "tiles" : "content";

  if (mode === "tiles") {
    const chosen = (header?.tiles ?? [])
      .map((t) => t?.trim())
      .filter((t): t is string => Boolean(t));

    if (chosen.length >= MIN_HEADER_TILES) return Array.from(new Set(chosen));

    // Top up from every catalogue, not just the selected ones — at this
    // point the editor has not chosen any, and a thin wall is the problem
    // being solved.
    const everything = [
      ...pools.films,
      ...pools.studio,
      ...pools.academy,
    ].filter(Boolean);

    return Array.from(new Set([...chosen, ...everything]));
  }

  const fromSources = (header?.sources ?? [])
    .flatMap((id) => pools[id] ?? [])
    .filter(Boolean);

  return Array.from(new Set(fromSources));
}
