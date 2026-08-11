import { supabase } from "./supabase";

/**
 * Gates access to "request_only" trailers. Access is granted immediately once
 * a visitor submits the short request form (no manual approval queue) — the
 * grant is remembered in localStorage so they aren't asked again, and the
 * request itself is logged to Supabase for the team to see who's asking.
 */

function storageKey(filmId: string) {
  return `dsh_trailer_access_${filmId}`;
}

export function hasTrailerAccess(filmId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey(filmId)) === "granted";
  } catch {
    return false;
  }
}

function grantTrailerAccess(filmId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(filmId), "granted");
  } catch {
    // ignore — worst case they see the request form again next time
  }
}

export interface TrailerAccessRequestInput {
  filmId: string;
  filmTitle: string;
  name: string;
  email: string;
  organization?: string;
  reason?: string;
}

/** Logs the request to Supabase, then grants local access. Never throws —
 * if the insert fails (e.g. offline), access is still granted so a backend
 * hiccup never blocks someone from watching a trailer they asked to see. */
export async function submitTrailerAccessRequest(input: TrailerAccessRequestInput): Promise<void> {
  try {
    await supabase.from("trailer_access_requests").insert({
      film_id: input.filmId,
      film_title: input.filmTitle,
      name: input.name,
      email: input.email,
      organization: input.organization || null,
      reason: input.reason || null,
    });
  } catch {
    // logged best-effort — see note above
  } finally {
    grantTrailerAccess(input.filmId);
  }
}
