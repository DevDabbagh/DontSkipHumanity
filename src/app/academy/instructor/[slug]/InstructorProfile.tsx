"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { InstructorProfile as Profile } from "@/lib/api";

/**
 * A person on DSH: their courses, and everything else they are part of —
 * articles they wrote (Read), projects they host (Studio), films they directed.
 * Sections with nothing in them are not shown, so a person with only courses
 * gets a clean courses page, not three empty headings.
 */

const EYEBROW = "text-[11px] leading-[24px] tracking-[1.76px] uppercase";
const BODY_16 = "font-[family-name:var(--font-source-sans)] text-[16px] leading-[26px]";
const BODY_14 = "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";

/** "@handle" → its Instagram page; a full URL is used as it is. */
function handleHref(h: string) {
  const t = h.trim();
  if (/^https?:\/\//.test(t)) return t;
  return `https://www.instagram.com/${t.replace(/^@/, "")}/`;
}

function Card({
  href,
  image,
  eyebrow,
  title,
  text,
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-[14px]">
      <div className="relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#161616]" style={{ border: "1px solid rgba(240,240,240,0.06)" }}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div>
        <p className={`${EYEBROW} text-[#32C6CC]`}>{eyebrow}</p>
        <h3 className="text-[17px] font-semibold leading-[23px] tracking-[-0.3px] text-[#F0F0F0] group-hover:text-white">{title}</h3>
        {text && <p className={`${BODY_14} mt-[6px] text-[#595C5C] line-clamp-2`}>{text}</p>}
      </div>
    </Link>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="pt-[70px]">
      <div className="flex items-baseline justify-between pb-[24px]" style={{ borderBottom: "1px solid #1F1F1F" }}>
        <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-[#F0F0F0]">{title}</h2>
        <span className={`${EYEBROW} text-[#595C5C]`}>{count}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-[28px] gap-y-[40px] pt-[30px]">{children}</div>
    </section>
  );
}

export default function InstructorProfile({ profile }: { profile: Profile }) {
  const href = useLocaleHref();
  const { instructor: p, courses, articles, studio, films } = profile;
  const initials = p.name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { n: courses.length, label: courses.length === 1 ? "course" : "courses" },
    { n: articles.length, label: articles.length === 1 ? "article" : "articles" },
    { n: studio.length, label: studio.length === 1 ? "Studio project" : "Studio projects" },
    { n: films.length, label: films.length === 1 ? "film" : "films" },
  ].filter((s) => s.n > 0);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="film-grain" />
      <Navbar />

      <div className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[160px]">
        <Link
          href={href("/academy")}
          className="flex w-fit items-center gap-[7px] text-[13px] font-medium text-[#595C5C] hover:text-[#8B8F8F] transition-colors"
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path d="M11 4H1M1 4L4 1M1 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Academy
        </Link>

        {/* ── Who ── */}
        <div className="grid md:grid-cols-[220px_1fr] gap-[36px] md:gap-[56px] items-start pt-[50px]">
          <div
            className="relative size-[180px] md:size-[220px] rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(50,198,204,0.35), rgba(178,52,149,0.35))",
              border: "1px solid rgba(240,240,240,0.1)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            }}
          >
            {p.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photoUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-[56px] font-semibold text-[#F0F0F0]">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <p className={`${EYEBROW} text-[#595C5C]`}>Instructor · DSH Academy</p>
            <h1 className="text-[36px] md:text-[44px] font-semibold leading-[1.1] tracking-[-1px] text-[#F0F0F0] mt-[6px]">{p.name}</h1>
            {p.role && (
              <p className={`${EYEBROW} text-[#32C6CC] mt-[12px] whitespace-pre-line`}>{p.role}</p>
            )}

            {stats.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-[22px] gap-y-[6px] mt-[18px] text-[14px]">
                {stats.map((s) => (
                  <span key={s.label}>
                    <span className="font-semibold text-[#F0F0F0]">{s.n}</span>{" "}
                    <span className="text-[#595C5C]">{s.label}</span>
                  </span>
                ))}
              </div>
            )}

            {p.handles.length > 0 && (
              <div className="flex flex-wrap gap-[10px] mt-[20px]">
                {p.handles.map((h) => (
                  <a
                    key={h}
                    href={handleHref(h)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-[12px] py-[7px] rounded-[3px] text-[12px] font-medium text-[#F0F0F0] transition-colors hover:bg-[rgba(50,198,204,0.15)]"
                    style={{ border: "1px solid rgba(240,240,240,0.15)" }}
                  >
                    {h} ↗
                  </a>
                ))}
              </div>
            )}

            {p.bio && (
              <div className={`${BODY_16} text-[#9D9C9C] mt-[26px] max-w-[760px] whitespace-pre-line`}>{p.bio}</div>
            )}
          </div>
        </div>

        {/* ── Their work on DSH ── */}
        {courses.length > 0 && (
          <Section title="Courses on the Academy" count={courses.length}>
            {courses.map((c) => (
              <Card
                key={c.slug}
                href={href(`/course/${c.slug}`)}
                image={c.thumbnailUrl}
                eyebrow={[c.type, c.duration].filter(Boolean).join(" · ")}
                title={c.title}
                text={c.description}
              />
            ))}
          </Section>
        )}

        {articles.length > 0 && (
          <Section title="Writing on Read" count={articles.length}>
            {articles.map((a) => (
              <Card key={a.slug} href={href(`/read/${a.slug}`)} image={a.mainImage} eyebrow="Article" title={a.title} text={a.excerpt} />
            ))}
          </Section>
        )}

        {studio.length > 0 && (
          <Section title="In the Studio" count={studio.length}>
            {studio.map((s) => (
              <Card
                key={s.slug}
                href={href(`/studio/${s.slug}`)}
                image={s.thumbnailUrl || s.coverUrl}
                eyebrow={s.format}
                title={s.title}
                text={s.oneLineDescription || s.synopsisShort}
              />
            ))}
          </Section>
        )}

        {films.length > 0 && (
          <Section title="Films" count={films.length}>
            {films.map((f) => (
              <Card key={f.slug} href={href(`/film/${f.slug}`)} image={f.thumbnailUrl || f.posterUrl} eyebrow="Film" title={f.title} text={f.logline} />
            ))}
          </Section>
        )}

        <div className="pb-[140px]" />
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}
