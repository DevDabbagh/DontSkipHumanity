"use client";

import type { ReactNode, MouseEventHandler } from "react";

// Small rectangular ghost button used on About / Support pages
// (distinct from the pill-shaped "Explore X +" buttons used elsewhere on the site).
export default function SecondaryBtn({
  children,
  onClick,
  full = false,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[14px] font-normal px-5 py-2 rounded-[3px] transition-colors hover:text-[#999] ${full ? "w-full" : ""}`}
      style={{
        background: "rgba(27,27,27,0.2)",
        border: "1px solid rgba(240,240,240,0.20)",
        color: "rgba(240,240,240,0.4)",
      }}
    >
      {children}
    </button>
  );
}
