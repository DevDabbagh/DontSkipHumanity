/**
 * Putting Bunny in front of Supabase Storage for images.
 *
 * WHY THIS EXISTS
 *
 * Video already left Supabase — a 9.4MB looping hero spent the project's whole
 * monthly egress allowance in two days, which is what `lib/bunny.ts` in the
 * dashboard was written to fix. Images were left behind, and they are the
 * larger share of what a reader actually downloads: posters, stills, mosaic
 * tiles, article artwork, on every page.
 *
 * Supabase charges $0.09/GB past the included 250GB. Bunny charges $0.005/GB
 * in Europe and North America. On the same bytes that is roughly eighteen
 * times cheaper, and the saving arrives without anything moving: a pull zone
 * fetches each file from Supabase once and serves every later request from an
 * edge near the reader.
 *
 * HOW IT IS SET UP
 *
 * In Bunny: a CDN pull zone whose ORIGIN is the Supabase project URL
 * (`https://<project>.supabase.co`). Nothing else. The storage bucket is
 * already public, so Bunny needs no credential, and the path is unchanged —
 * only the hostname differs:
 *
 *   https://<project>.supabase.co/storage/v1/object/public/media/films/x.webp
 *   https://<zone>.b-cdn.net/storage/v1/object/public/media/films/x.webp
 *
 * WHY THE REWRITE HAPPENS ON READ AND NOT ON UPLOAD
 *
 * The tempting version writes the Bunny URL into the database at upload time
 * and skips this file entirely. `video-url.ts` already argued against that and
 * it applies here too: a stored CDN host means a custom domain, a new pull
 * zone, or a move off Bunny rewrites every row in every content table. What is
 * stored stays the Supabase URL — the durable address of the actual file — and
 * the delivery host is decided when the page is rendered.
 *
 * That is also what makes this safe to switch off. `NEXT_PUBLIC_BUNNY_LEGACY_CDN`
 * unset means every function here returns its input untouched and images come
 * from Supabase exactly as before. No migration either way, and no upload path
 * is touched, so a misconfigured zone can never cost an editor their work.
 *
 * WHAT IT DELIBERATELY DOES NOT TOUCH
 *
 * Only Supabase Storage URLs are rewritten. A site-relative `/images/x.jpg`
 * lives in this app's own `public/` folder and is already served by Vercel's
 * CDN; a `data:` URI has no host; an external URL someone pasted belongs to
 * somebody else and must not be proxied through our zone.
 */

/**
 * THE ZONE THAT REWRITES OLD URLS IS NOT THE ZONE NEW UPLOADS LAND IN
 *
 * This was one variable doing two incompatible jobs, and it would have taken
 * every existing image down the first time it was configured.
 *
 * A pull zone has exactly ONE origin. The two jobs need different ones:
 *
 *   · new uploads live in a Bunny Storage zone and are served as
 *     `https://<zone>/films/123-poster.webp` — a pull zone whose origin IS
 *     that storage zone
 *   · old files are still physically in Supabase, at
 *     `/storage/v1/object/public/media/films/x.webp`, and this file rewrites
 *     only their hostname — which needs a pull zone whose origin is the
 *     Supabase project URL
 *
 * Point one zone at storage and ask it for `/storage/v1/object/public/...`
 * and it looks for that path inside the storage zone, does not find it, and
 * returns 404. Every image uploaded before the move, gone at once, from a
 * change that looks like configuration rather than deletion.
 *
 * So: two variables, two zones. `NEXT_PUBLIC_BUNNY_IMAGE_CDN` is where new
 * uploads are served from and is read by the upload code, not here. The one
 * below is only for the older Supabase-hosted files.
 *
 * Leaving it unset is a safe, sensible choice: old images then come straight
 * from Supabase exactly as they do today. That costs Supabase egress on a set
 * of files that only ever shrinks, and it is one less thing to get wrong.
 */
const ZONE = (process.env.NEXT_PUBLIC_BUNNY_LEGACY_CDN ?? "").trim();

/** The marker that says a URL is a file in Supabase Storage. */
const STORAGE_PATH = "/storage/v1/object/public/";

/**
 * The delivery URL for a stored image.
 *
 * Returns the input unchanged for everything that is not a Supabase Storage
 * URL, and for every input at all when no zone is configured.
 */
export function cdnImage<T extends string | null | undefined>(url: T): T {
  if (!ZONE) return url;
  if (typeof url !== "string") return url;

  const raw = url.trim();
  if (!raw.startsWith("http")) return url;
  if (!raw.includes(STORAGE_PATH)) return url;

  try {
    const parsed = new URL(raw);

    // Already pointing at a Bunny zone — re-parsing would be harmless, but
    // this makes it explicit that running the function twice is safe. Mappers
    // are edited often and a value can pass through more than one of them.
    if (parsed.hostname.endsWith(".b-cdn.net")) return url;

    parsed.hostname = ZONE;
    // The zone always serves HTTPS, and an http:// original would otherwise
    // produce a mixed-content image that silently fails to load.
    parsed.protocol = "https:";
    parsed.port = "";

    return parsed.toString() as T;
  } catch {
    // A malformed URL is not worth throwing over in a page render. Serving it
    // from Supabase is the status quo, which is a working outcome.
    return url;
  }
}

/**
 * The same function, named for what it actually does.
 *
 * The pull zone sits in front of Supabase Storage and serves whatever is
 * there — mp4 and PDF included, range requests and all. Nothing in
 * [cdnImage] is specific to images; the name only reflects what it was
 * written for first.
 *
 * This alias exists so the video path can use it without reading as a
 * mistake. See `video-url.ts`: a slide uploaded as a plain file rather than
 * through Bunny Stream holds a Supabase URL, and was being served straight
 * from Supabase — 14MB a page view against a 5GB monthly allowance, which is
 * about 370 visits.
 *
 * It is NOT a substitute for Bunny Stream. Stream transcodes to several
 * renditions and serves HLS, so a weak connection drops quality instead of
 * stalling; this only changes who delivers the same single file. It is the
 * floor, not the goal — the goal is that these get re-uploaded to Stream.
 */
export const cdnAsset = cdnImage;

/** The same, for a list column. Non-string entries are dropped. */
export function cdnImages(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.filter((u): u is string => typeof u === "string").map((u) => cdnImage(u));
}

/**
 * True when images are being served through Bunny.
 *
 * For the dashboard's settings screen and for a build-time assertion before
 * launch — the same role `SiteConfig.isPreviewDomain` plays for the domain.
 */
export const imageCdnEnabled = ZONE.length > 0;
