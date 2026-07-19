"use client";

import { useEffect, useRef } from "react";

export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal all animated children
            const targets = entry.target.querySelectorAll(
              ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stat-reveal"
            );
            targets.forEach((target) => {
              target.classList.add("revealed");
            });
            // Also reveal the container itself if it has a reveal class
            if (
              entry.target.classList.contains("reveal") ||
              entry.target.classList.contains("reveal-left") ||
              entry.target.classList.contains("reveal-right") ||
              entry.target.classList.contains("reveal-scale") ||
              entry.target.classList.contains("stat-reveal")
            ) {
              entry.target.classList.add("revealed");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

export function useRevealAll(threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const targets = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stat-reveal"
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);
}
