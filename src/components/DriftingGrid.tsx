"use client";

// Reusable drifting image mosaic — 5 columns, alternating scroll direction.
// Used behind the hero on the About and Support pages.

const GRID_IMGS = [
  "/images/slider1.jpg",
  "/images/slider2.jpg",
  "/images/slidere3.jpg",
  "/images/studio.jpg",
  "/images/journalism.jpg",
  "/images/political-education.jpg",
  "/images/infocus.jpg",
  "/images/note.jpg",
  "/images/support.jpg",
  "/images/impact_metrics_background.jpg",
  "/images/slider1.jpg",
  "/images/slider2.jpg",
  "/images/slidere3.jpg",
  "/images/studio.jpg",
  "/images/journalism.jpg",
  "/images/political-education.jpg",
  "/images/infocus.jpg",
  "/images/note.jpg",
];

const COLUMNS = [
  { imgs: [0, 5, 10, 15], dir: "driftA", duration: "30s", left: "1%", w: "18.5%" },
  { imgs: [1, 6, 11, 16], dir: "driftB", duration: "38s", left: "20.5%", w: "18.5%" },
  { imgs: [2, 7, 12, 17], dir: "driftA", duration: "26s", left: "40%", w: "18.5%" },
  { imgs: [3, 8, 13, 14], dir: "driftB", duration: "34s", left: "59.5%", w: "18.5%" },
  { imgs: [4, 9, 10, 15], dir: "driftA", duration: "29s", left: "79%", w: "18.5%" },
];

export default function DriftingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {COLUMNS.map((col, ci) => {
        const tiles = [...col.imgs, ...col.imgs]; // doubled for a seamless loop
        return (
          <div key={ci} className="absolute" style={{ left: col.left, width: col.w, top: 0 }}>
            <div style={{ animation: `${col.dir} ${col.duration} linear infinite`, willChange: "transform" }}>
              {tiles.map((imgIdx, ti) => (
                <div
                  key={ti}
                  style={{
                    marginBottom: 6,
                    borderRadius: 4,
                    overflow: "hidden",
                    aspectRatio: "3/4",
                    position: "relative",
                    isolation: "isolate",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={GRID_IMGS[imgIdx % GRID_IMGS.length]}
                    alt=""
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: "grayscale(1) brightness(0.45) contrast(1.1)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Centre vignette — keeps text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 75% at 50% 50%, rgba(13,13,13,0.82) 25%, rgba(13,13,13,0.45) 65%, rgba(13,13,13,0.12) 100%)",
        }}
      />
      {/* Top + bottom hard fade into page background */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: "18%", background: "linear-gradient(to bottom, #0D0D0D 30%, transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: "22%", background: "linear-gradient(to top, #0D0D0D 30%, transparent)" }}
      />
    </div>
  );
}
