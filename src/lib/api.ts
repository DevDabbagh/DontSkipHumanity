/**
 * API Service Layer
 * ─────────────────
 * Currently returns mock data.
 * When the backend API is ready, swap the implementations below
 * with fetch() calls to your dashboard endpoints.
 *
 * Example future usage:
 *   const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.dontskiphumanity.com";
 *   export async function getFilms() {
 *     const res = await fetch(`${API_BASE}/api/films?status=published`);
 *     return res.json();
 *   }
 */

import type { Film, AcademyProgram, Article, DSHEvent } from "./types";
import {
  MOCK_FILMS,
  MOCK_PROGRAMS,
  MOCK_ARTICLES,
  MOCK_EVENTS,
  getFilmBySlug as mockGetFilm,
  getProgramBySlug as mockGetProgram,
  getArticleBySlug as mockGetArticle,
  getEventBySlug as mockGetEvent,
} from "./mock-data";

// ─── Films ──────────────────────────────────────────────────────

export async function getFilms(): Promise<Film[]> {
  // TODO: Replace with API call
  // const res = await fetch(`${API_BASE}/api/films?status=published`);
  // return res.json();
  return MOCK_FILMS.filter((f) => f.status === "published");
}

export async function getFeaturedFilms(): Promise<Film[]> {
  return MOCK_FILMS.filter((f) => f.status === "published" && f.isFeatured);
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  // TODO: Replace with API call
  // const res = await fetch(`${API_BASE}/api/films/${slug}`);
  // if (!res.ok) return null;
  // return res.json();
  return mockGetFilm(slug) ?? null;
}

// ─── Academy Programs ───────────────────────────────────────────

export async function getPrograms(): Promise<AcademyProgram[]> {
  return MOCK_PROGRAMS.filter((p) => p.status === "published");
}

export async function getProgramBySlug(slug: string): Promise<AcademyProgram | null> {
  return mockGetProgram(slug) ?? null;
}

// ─── Articles ───────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  return MOCK_ARTICLES.filter((a) => a.status === "published");
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return mockGetArticle(slug) ?? null;
}

// ─── Events ─────────────────────────────────────────────────────

export async function getEvents(): Promise<DSHEvent[]> {
  return MOCK_EVENTS;
}

export async function getUpcomingEvents(): Promise<DSHEvent[]> {
  return MOCK_EVENTS.filter((e) => e.status === "upcoming");
}

export async function getEventBySlug(slug: string): Promise<DSHEvent | null> {
  return mockGetEvent(slug) ?? null;
}

// ─── Dashboard Stats (for impact section) ───────────────────────

export async function getDashboardStats() {
  // TODO: Replace with API call to dashboard
  // const res = await fetch(`${API_BASE}/api/stats`);
  // return res.json();
  return {
    countriesReached: 47,
    academyParticipants: 8200,
    festivalSelections: 23,
    redistributed: "€2.4M",
  };
}
