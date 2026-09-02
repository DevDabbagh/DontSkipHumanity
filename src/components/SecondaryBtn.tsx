"use client";

import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

// Small rectangular ghost button used on About / Support pages
// (distinct from the pill-shaped "Explore X +" buttons used elsewhere on the site).
//
// Given an `href` it renders a real link rather than a button. These used to be
// buttons with no handler — they looked clickable and did nothing, which is the
// worst of both. Now that the destinations are editable in the dashboard, a
// filled-in destination becomes a link and an empty one stays inert.
const CLASSES =
  "inline-block text-[14px] font-normal px-5 py-2 rounded-[3px] transition-colors hover:text-[#999]";

const STYLE = {
  background: "rgba(27,27,27,0.2)",
  border: "1px solid rgba(240,240,240,0.20)",
  color: "rgba(240,240,240,0.4)",
} as const;

export default function SecondaryBtn({
  children,
  onClick,
  href,
  full = false,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  full?: boolean;
}) {
  const className = `${CLASSES} ${full ? "w-full text-center" : ""}`;

  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external) {
      return (
        <a href={href} className={className} style={STYLE}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className} style={STYLE}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} style={STYLE}>
      {children}
    </button>
  );
}
