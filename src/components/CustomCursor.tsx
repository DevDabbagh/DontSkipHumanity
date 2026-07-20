"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverType, setHoverType] = useState<"link" | "card" | "play" | null>(null);
  
  const pathname = usePathname();

  // Use MotionValues instead of React state for high performance
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Use springs for ultra-smooth buttery following
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a, button");
      const card = target.closest(".reveal-scale, .group");
      
      if (link) {
        setIsHovering(true);
        setHoverType("link");
      } else if (card) {
        setIsHovering(true);
        setHoverType("card");
      } else {
        setIsHovering(false);
        setHoverType(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [pathname, cursorX, cursorY]);

  // Determine variants based on hover state
  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "rgba(255, 255, 255, 1)",
      x: "-50%",
      y: "-50%",
      opacity: 1,
    },
    link: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      x: "-50%",
      y: "-50%",
      opacity: 1,
    },
    card: {
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(4px)",
      x: "-50%",
      y: "-50%",
      opacity: 1,
    }
  };

  // Hide cursor on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { cursor: none; }
        a, button, [role="button"] { cursor: none; }
      `}} />
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
        style={{
          left: springX,
          top: springY,
        }}
        variants={variants}
        animate={isHovering ? hoverType || "default" : "default"}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </>
  );
}
