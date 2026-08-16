"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

/* ── Category color map ── */
const CATEGORY_COLORS: Record<string, { text: string; moreBg: string }> = {
  Screening:  { text: "#8665A7", moreBg: "rgba(134,101,167,0.2)" },
  Workshop:   { text: "#32C6CC", moreBg: "rgba(50,198,204,0.2)" },
  Document:   { text: "#B23495", moreBg: "rgba(178,52,149,0.2)" },
  Interviews: { text: "#5D94B9", moreBg: "rgba(93,148,185,0.2)" },
  Festival:   { text: "#8665A7", moreBg: "rgba(134,101,167,0.2)" },
};

const EVENTS = [
  {
    day: "28",
    month: "Jul",
    type: "Screening",
    title:
      "What We Carried — IDFA 2026, Amsterdam · [date to confirm, yes please confirm on time]",
    desc: "Add 2 lines just to check the looks. Looks great!\nAdd 3 lines just to check the looks.",
    slug: "what-we-carried-screening",
    upcoming: false,
  },
  {
    day: "08",
    month: "Aug",
    type: "Workshop",
    title:
      "What We Carried — IDFA 2026, Amsterdam · [date to confirm, yes please confirm on time]",
    desc: "Add 2 lines just to check the looks. Looks great!\nAdd 3 lines just to check the looks.",
    slug: "what-we-carried-workshop",
    upcoming: true, // next upcoming → highlighted row
  },
  {
    day: "08",
    month: "Aug",
    type: "Document",
    title:
      "What We Carried — IDFA 2026, Amsterdam · [date to confirm, yes please confirm on time]",
    desc: "Add 2 lines just to check the looks. Looks great!\nAdd 3 lines just to check the looks.",
    slug: "what-we-carried-document",
    upcoming: false,
  },
  {
    day: "08",
    month: "Aug",
    type: "Interviews",
    title:
      "What We Carried — IDFA 2026, Amsterdam · [date to confirm, yes please confirm on time]",
    desc: "Add 2 lines just to check the looks. Looks great!\nAdd 3 lines just to check the looks.",
    slug: "what-we-carried-interviews",
    upcoming: false,
  },
];

/* ── More icon (ic_more_landing circle) ── */
function MoreIcon({ color }: { color: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 11.5V7.5H7.5C7.22386 7.5 7 7.27614 7 7C7 6.72386 7.22386 6.5 7.5 6.5H8C8.55228 6.5 9 6.94772 9 7.5V11.5H9.5C9.77614 11.5 10 11.7239 10 12C10 12.2761 9.77614 12.5 9.5 12.5H9C8.44772 12.5 8 12.0523 8 11.5ZM8.50977 4.5C8.78591 4.5 9.00977 4.72386 9.00977 5C9.00977 5.27614 8.78591 5.5 8.50977 5.5H8.5C8.22386 5.49999 8 5.27614 8 5C8 4.72386 8.22386 4.50001 8.5 4.5H8.50977Z"
        fill={color}
      />
      <path
        d="M10.3401 0.201388C9.25049 -0.040176 8.12382 -0.0646233 7.02469 0.129123C5.92541 0.322955 4.87431 0.731518 3.93289 1.33127C2.99154 1.93101 2.17759 2.71091 1.53738 3.62522C0.897259 4.5395 0.443016 5.57073 0.201443 6.66037C-0.0401211 7.75 -0.0645695 8.87667 0.129177 9.9758C0.323009 11.0751 0.731573 12.1262 1.33133 13.0676C1.93106 14.0089 2.71096 14.8229 3.62527 15.4631C4.53955 16.1032 5.57079 16.5575 6.66043 16.799C7.75005 17.0406 8.87672 17.0651 9.97586 16.8713C11.0751 16.6775 12.1262 16.2689 13.0677 15.6692C14.009 15.0694 14.823 14.2895 15.4632 13.3752C16.1033 12.4609 16.5575 11.4297 16.7991 10.3401C17.0407 9.25043 17.0651 8.12377 16.8714 7.02463C16.6775 5.92535 16.269 4.87426 15.6692 3.93283C15.0695 2.99149 14.2896 2.17753 13.3753 1.53733C12.461 0.897203 11.4298 0.442961 10.3401 0.201388ZM7.19754 1.11447C8.16741 0.94346 9.16183 0.964828 10.1233 1.17795C11.0849 1.39112 11.9952 1.79174 12.802 2.35666C13.6088 2.92159 14.2963 3.64025 14.8255 4.47092C15.3545 5.30141 15.715 6.22776 15.886 7.19748C16.057 8.16735 16.0357 9.16177 15.8225 10.1233C15.6094 11.0848 15.2087 11.9952 14.6438 12.802C14.0789 13.6088 13.3602 14.2962 12.5296 14.8254C11.6991 15.3545 10.7727 15.7149 9.80301 15.886C8.83314 16.057 7.83872 16.0356 6.87722 15.8225C5.91566 15.6093 5.00531 15.2087 4.19851 14.6438C3.39172 14.0788 2.70427 13.3602 2.17508 12.5295C1.64603 11.699 1.28557 10.7727 1.11453 9.80295C0.943516 8.83308 0.964884 7.83866 1.17801 6.87717C1.39118 5.9156 1.79179 5.00525 2.35672 4.19846C2.92164 3.39166 3.64031 2.70422 4.47097 2.17502C5.30147 1.64598 6.22782 1.28552 7.19754 1.11447Z"
        fill={color}
      />
    </svg>
  );
}

export default function Agenda() {
  const sectionRef = useReveal();

  return (
    <section
      className="py-10 sm:py-12 lg:py-16 px-5 sm:px-8 max-w-[1400px] mx-auto"
      ref={sectionRef}
    >
      {/* ── Header row ── */}
      <div className="reveal flex items-end justify-between mb-10 sm:mb-12">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase mb-4 text-[#363636]">
            Agenda
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight max-w-2xl text-[#F0F0F0]">
            DSH makes documentary and fiction
            <br />
            – from development and production to festivals.
          </h2>
        </div>

        <Link
          href="/agenda"
          className="shrink-0 mt-2 text-xs sm:text-sm rounded-[3px] px-4 sm:px-5 py-2 text-[#F0F0F0]/60 hover:text-[#F0F0F0]/80 transition-colors inline-flex items-center gap-1.5"
          style={{
            background: "rgba(27,27,27,0.2)",
            border: "1px solid rgba(240,240,240,0.2)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          View all events
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7v10"
            />
          </svg>
        </Link>
      </div>

      {/* ── Events list ── */}
      <div>
        {EVENTS.map((event, i) => {
          const colors = CATEGORY_COLORS[event.type] ?? CATEGORY_COLORS.Screening;

          return (
            <Link
              key={`${event.slug}-${i}`}
              href={`/agenda/${event.slug}`}
              className={`reveal stagger-${Math.min(i + 1, 5)} block group transition-colors ${
                event.upcoming ? "" : "hover:bg-[#363636]/[0.14]"
              }`}
              style={{
                borderBottom: "1px solid rgba(54,54,54,0.5)",
                ...(event.upcoming ? { background: "rgba(54,54,54,0.14)" } : {}),
              }}
            >
              <div className="flex items-center gap-4 sm:gap-6 md:gap-10 py-5 sm:py-6 md:py-8 px-2 sm:px-4">
                {/* Date */}
                <div className="shrink-0 flex items-baseline gap-1 w-[70px] sm:w-[90px]">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-light text-[#F0F0F0]">
                    {event.day}
                  </span>
                  <span
                    className="text-xs sm:text-sm"
                    style={{ color: colors.text }}
                  >
                    {event.month}
                  </span>
                </div>

                {/* Category */}
                <div className="shrink-0 w-[80px] sm:w-[100px]">
                  <span
                    className="text-xs sm:text-sm"
                    style={{ color: colors.text }}
                  >
                    {event.type}
                  </span>
                </div>

                {/* Title + description */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#F0F0F0] leading-relaxed line-clamp-1">
                    {event.title}
                  </p>
                  {event.desc.split("\n").map((line, j) => (
                    <p
                      key={j}
                      className="text-xs sm:text-sm text-[#595C5C] leading-relaxed line-clamp-1"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* More button */}
                <div className="shrink-0">
                  <span
                    className="inline-flex items-center gap-2 text-xs sm:text-sm rounded-[3px] px-3 sm:px-4 py-1.5 sm:py-2 transition-opacity group-hover:opacity-80"
                    style={{
                      background: colors.moreBg,
                      color: colors.text,
                    }}
                  >
                    more
                    <MoreIcon color={colors.text} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
