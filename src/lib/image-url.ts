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
 * That is also what makes this safe to switch off. `NEXT_PUBLIC_BUNNY_IMAGE_CDN`
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
 * The pull-zone hostname, e.g. `dsh-media.b-cdn.net`.
 *
 * Public by design — it appears in the src of every image on the page, the
 * same way the Supabase host does today. Empty is the off switch.
 */
const ZONE = (process.env.NEXT_PUBLIC_BUNNY_IMAGE_CDN ?? "").trim();

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
