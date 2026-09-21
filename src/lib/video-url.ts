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

import { cdnAsset } from "./image-url";

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
  // URL somebody pasted.
  //
  // A `file` slide uploaded through the dashboard holds a Supabase Storage
  // URL, and returning it untouched meant the browser streamed it straight
  // out of Supabase. The home hero is ~14MB; against the free plan's 5GB
  // monthly egress that is roughly 370 page views, and it is what put the
  // project over quota.
  //
  // `cdnAsset` is a no-op for an `embed` iframe URL, for an `hls` playlist
  // hosted elsewhere, and for anything that is not a Supabase Storage URL —
  // so this only redirects the case that was actually bleeding.
  //
  // This is the floor, not the fix. It changes who serves the same single
  // file; it does not give adaptive renditions. A hero video belongs in
  // Bunny Stream (`provider: "bunny"`), and this should stop mattering once
  // these are re-uploaded.
  return cdnAsset(ref);
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

/**
 * MP4 addresses for the same video, best quality first.
 *
 * WHY A SLIDER LOOP MUST NOT USE THE HLS PLAYLIST
 *
 * `videoPlaybackUrl` above returns `playlist.m3u8`, and for watch-content that
 * is right: adaptive bitrate means a weak connection drops a rendition instead
 * of stalling, which over ninety minutes is the difference between watchable
 * and abandoned.
 *
 * Over a five-second loop it is the wrong trade, and measurably so. HLS costs
 * three round trips before a single frame appears — master playlist, variant
 * playlist, first segment — and on top of that the browser has to fetch and
 * run hls.js, because only Safari plays HLS natively. An MP4 paints after one
 * range request. For the hero slider, where the whole requirement is "it must
 * not stutter, not for one second", the adaptive ladder buys nothing and the
 * latency costs everything.
 *
 * WHY A LIST AND NOT ONE URL
 *
 * Bunny only generates the renditions enabled under the library's Encoding
 * tab. Hard-coding `play_720p.mp4` means a 404 and a dead slide the day
 * somebody unticks 720p — a configuration change in a different system, with
 * no error anywhere near the code. Returning the ladder lets the player render
 * one `<source>` per entry and let the browser take the first that loads,
 * which is exactly what source fallback is for.
 *
 * REQUIRES `MP4 Fallback` ENABLED (Stream → library → Encoding). Bunny only
 * generates the MP4 for videos uploaded AFTER it is switched on — an older
 * video has the playlist and no `play_*.mp4`, so the player falls through to
 * the HLS source last in the list.
 */
export function videoMp4Urls(
  provider: VideoProvider | undefined,
  value: string
): string[] {
  const ref = (value ?? "").trim();
  if (!ref) return [];

  if (provider === "bunny" || (!provider && looksLikeBunnyId(ref))) {
    if (!CDN) return [];
    // Descending, because the first that loads wins and the slider is a
    // full-bleed background — the better rendition is worth having when the
    // library offers it.
    return [1080, 720, 480, 360].map((h) => `https://${CDN}/${ref}/play_${h}p.mp4`);
  }

  // `file` and `hls` hold a finished address already. An MP4 sitting on
  // storage is exactly what this function is for, so it passes through; an
  // `.m3u8` in there would be wrong, but that is a row that predates this and
  // the HLS fallback below still catches it.
  return [cdnAsset(ref)];
}

/**
 * Everything the slider should try, in order: the MP4 renditions, then the
 * HLS playlist as a last resort.
 *
 * The playlist entry is what keeps videos uploaded BEFORE MP4 Fallback was
 * enabled playing at all. It goes last so it is only reached when no MP4
 * exists — a browser that cannot play HLS natively will simply fail that
 * source, and the poster underneath stays up, which is the honest outcome.
 */
export function videoSourceLadder(
  provider: VideoProvider | undefined,
  value: string
): string[] {
  const mp4 = videoMp4Urls(provider, value);
  const hls = videoPlaybackUrl(provider, value);
  return hls && !mp4.includes(hls) ? [...mp4, hls] : mp4;
}
