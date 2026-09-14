/**
 * Turning a stored video reference into something a player can open.
 *
 * A copy of the same file in `dsh-admin`, deliberately. The two projects have
 * no shared package and are deployed separately, so the alternative to a copy
 * was a build-time dependency between them — which would mean the website
 * could not deploy without the dashboard. Sixty lines of agreement is the
 * cheaper coupling.
 *
 * If you change one, change the other. The Flutter app mirrors it again in
 * `lib/app/config/bunny_config.dart`.
 *
 * WHAT IS STORED, AND WHY IT IS THE ID AND NOT THE URL
 *
 * `videoProvider` = 'bunny' and `videoSrc` = the Bunny guid. Storing the
 * finished playlist URL instead would mean that the day the CDN hostname
 * changes — a custom domain, a new pull zone, a move off Bunny — every row
 * holds a dead address. An id plus a hostname resolved at read time survives
 * all of that.
 */

export type VideoProvider = "file" | "hls" | "bunny" | "embed";

/** Public by design; shipped to the browser the same way an image host is. */
const CDN = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME ?? "";

/**
 * The adaptive playlist. HLS rather than an MP4 so a weak connection drops to
 * a lower rendition instead of stalling — which for an audience on Brazilian
 * and Middle Eastern mobile networks is the difference between watchable and
 * abandoned.
 */
export function videoPlaybackUrl(
  provider: VideoProvider | undefined,
  value: string
): string {
  const ref = (value ?? "").trim();
  if (!ref) return "";

  if (provider === "bunny" || (!provider && looksLikeBunnyId(ref))) {
    return CDN ? `https://${CDN}/${ref}/playlist.m3u8` : "";
  }

  // `file` and `hls` already hold a complete address; `embed` is an iframe
  // URL somebody pasted. All three are used as-is.
  return ref;
}

/**
 * The still Bunny generates from the video — the exact frame playback starts
 * on, so there is no jump when it begins.
 */
export function videoThumbnailUrl(
  provider: VideoProvider | undefined,
  value: string
): string {
  const ref = (value ?? "").trim();
  if (!ref || !CDN) return "";
  if (provider !== "bunny" && !looksLikeBunnyId(ref)) return "";
  return `https://${CDN}/${ref}/thumbnail.jpg`;
}

/** True when the value is a Bunny id rather than a URL. */
export function isBunny(
  provider: VideoProvider | undefined,
  value: string
): boolean {
  return provider === "bunny" || (!provider && looksLikeBunnyId(value ?? ""));
}

/**
 * Matched against the shape of a Bunny id, not merely "not a URL".
 *
 * The loose version — no scheme, no leading slash — also matched a bare
 * filename like `trailer.mp4`, and would have built a Bunny playlist URL out
 * of it. This only ever runs for rows saved before `videoProvider` existed, so
 * it should be as narrow as the thing it is guessing at: a UUID and nothing
 * else. Anything it rejects falls through and is used as a URL, which is what
 * those older rows actually hold.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeBunnyId(value: string): boolean {
  return UUID.test(value.trim());
}
