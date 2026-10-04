import { NextRequest, NextResponse } from "next/server";

/**
 * The certificate design, served from our own origin so the browser can draw
 * on it and export a PNG (a cross-origin image without CORS headers taints a
 * canvas). Only our Bunny zones are allowed — this is not an open proxy.
 */

const ALLOWED = [
  (process.env.NEXT_PUBLIC_BUNNY_IMAGE_CDN ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, ""),
  (process.env.NEXT_PUBLIC_BUNNY_LEGACY_CDN ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, ""),
  "dsh-zone.b-cdn.net",
].filter(Boolean);

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src") ?? "";
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return NextResponse.json({ error: "Bad image address" }, { status: 400 });
  }
  if (url.protocol !== "https:" || !ALLOWED.includes(url.hostname)) {
    return NextResponse.json({ error: "Image host not allowed" }, { status: 403 });
  }
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const type = res.headers.get("content-type") ?? "image/png";
  if (!type.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 415 });
  return new NextResponse(res.body, {
    headers: { "content-type": type, "cache-control": "public, max-age=86400, s-maxage=604800" },
  });
}
