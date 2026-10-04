"use client";

import Link from "next/link";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { AcademyInstructor } from "@/lib/types";

/**
 * A person, as a link to their page: round photo (initials when there is
 * none) and name. Used on the course page and in the lesson playlist, so the
 * instructor is one click away wherever their name appears.
 */
export default function InstructorChip({
  instructor,
  size = 36,
  sub,
}: {
  instructor: Pick<AcademyInstructor, "slug" | "name" | "photoUrl">;
  size?: number;
  /** A second line under the name, e.g. the role. */
  sub?: string;
}) {
  const href = useLocaleHref();
  const initials = instructor.name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={href(`/academy/instructor/${instructor.slug}`)} className="group flex items-center gap-[12px] min-w-0">
      <span
        className="relative shrink-0 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, rgba(50,198,204,0.35), rgba(178,52,149,0.35))",
          border: "1px solid rgba(240,240,240,0.12)",
        }}
      >
        {instructor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={instructor.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-[#F0F0F0]" style={{ fontSize: Math.round(size * 0.36) }}>
            {initials}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium leading-[20px] text-[#F0F0F0] group-hover:text-[#32C6CC] transition-colors truncate">
          {instructor.name}
        </span>
        {sub && <span className="block text-[11px] leading-[16px] tracking-[1.2px] uppercase text-[#595C5C] truncate">{sub}</span>}
      </span>
    </Link>
  );
}
