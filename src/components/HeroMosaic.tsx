"use client";

/* ═══════════════════════════════════════════════════════════════
   HeroMosaic — the drifting photo grid behind an inner-page hero.

   Both Films Landing and Studio Landing use the same construction in
   Figma: a full-bleed mosaic band (Films `641:200`, Studio `691:461`)
   with a solid panel sitting over the middle of it
   (`Rectangle 727` — x≈232, w=728 on the 1920 frame) so the headline
   reads against flat colour. Photos are therefore only visible in the
   narrow strip on the left and the block on the right.

   Rows drift in alternating directions — row 1 left, row 2 right,
   row 3 left — slowly and continuously.

   Two source modes:
     · `sheet`  — one exported Figma image containing the whole grid.
                  Sliced per row with background-position-y and looped by
                  shifting background-position-x exactly one image width.
     · `tiles`  — a list of images laid out as tiles. The row renders the
                  list twice and translates by -50%, so the loop is seamless.

   Reduced motion is handled by the global `prefers-reduced-motion` rule
   in globals.css, which zeroes out animation duration.
   ═══════════════════════════════════════════════════════════════ */

const ROW_H = 215; // 646 band ÷ 3 rows, per Figma
const ROWS = 3;

type Common = {
  /** Flat dim over the photos. Higher = darker. */
  dim?: number;
  /** Optional colour wash (e.g. the violet cast on the Films frame). */
  tint?: string;
  /** Seconds for one full loop. Higher = slower drift. */
  speed?: number;
};

type SheetProps = Common & {
  mode: "sheet";
  /** Exported Figma frame containing the full grid. */
  src: string;
  /** Natural size of that export, in px. */
  sheetWidth: number;
  sheetHeight: number;
  tiles?: never;
  tileWidth?: never;
};

type TilesProps = Common & {
  mode: "tiles";
  /** Images to lay out. Cycled if there are fewer than the grid needs. */
  tiles: string[];
  /** Width of one tile in px. */
  tileWidth?: number;
  /**
   * CSS filter on each tile. Sheet-mode exports arrive from Figma already
   * knocked back, so tile mode needs to match that by hand — otherwise raw
   * photos read much brighter than the exported wall.
   */
  tileFilter?: string;
  src?: never;
  sheetWidth?: never;
  sheetHeight?: never;
};

export type HeroMosaicProps = SheetProps | TilesProps;

export default function HeroMosaic(props: HeroMosaicProps) {
  const { dim = 0.55, tint, speed = 90 } = props;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* ── Drifting rows ── */}
      {Array.from({ length: ROWS }).map((_, row) => {
        const dir = row % 2 === 0 ? "left" : "right";
        /* Offset the third row so it doesn't march in lockstep with the
           first (both drift the same way). */
        const delay = row === 2 ? `-${speed / 3}s` : undefined;

        if (props.mode === "sheet") {
          return (
            <div
              key={row}
              className={`absolute left-0 w-full studio-mosaic-row studio-mosaic-row--${dir}`}
              style={{
                top: row * ROW_H,
                height: ROW_H,
                backgroundImage: `url(${props.src})`,
                backgroundSize: `${props.sheetWidth}px ${props.sheetHeight}px`,
                backgroundPositionY: `${-row * ROW_H}px`,
                animationDuration: `${speed}s`,
                animationDelay: delay,
              }}
            />
          );
        }

        return (
          <div
            key={row}
            className="absolute left-0 w-full overflow-hidden"
            style={{ top: row * ROW_H, height: ROW_H }}
          >
            <MarqueeRow
              tiles={props.tiles}
              tileWidth={props.tileWidth ?? 380}
              filter={props.tileFilter ?? "grayscale(1) brightness(0.5)"}
              row={row}
              dir={dir}
              speed={speed}
              delay={delay}
            />
          </div>
        );
      })}

      {/* ── Dim: the exports are the bare frames; in Figma an overlay above
             them knocks the photos back ── */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(13,13,13,${dim})` }}
      />

      {/* ── Optional colour wash ── */}
      {tint && <div className="absolute inset-0" style={{ background: tint }} />}

      {/* ── Centre panel — Figma `Rectangle 727`: x≈232, w=728 on the 1920
             frame, i.e. 116px left of the centred 1224 container.
             A solid rectangle with HARD edges, exactly as in the design —
             not a feathered gradient. Everything left of it is the narrow
             photo strip; everything right of it is the photo block. ── */}
      <div className="hidden xl:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1224px]">
        <div className="absolute inset-y-0 left-[-116px] w-[728px] bg-[#0D0D0D]" />
      </div>

      {/* Below xl the fixed offset can't hold its position — fall back to a
          solid block anchored to the left edge, still hard-edged. */}
      <div className="xl:hidden absolute inset-y-0 left-0 w-[68%] bg-[#0D0D0D]" />

      {/* ── Bottom falloff into the page background. Short, so the band still
             reads as a crisp horizontal strip. ── */}
      <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </div>
  );
}

/* ── One tile row. The tile list is rendered twice so translating the track
      by -50% lands on an identical frame. ── */
function MarqueeRow({
  tiles,
  tileWidth,
  filter,
  row,
  dir,
  speed,
  delay,
}: {
  tiles: string[];
  tileWidth: number;
  filter: string;
  row: number;
  dir: "left" | "right";
  speed: number;
  delay?: string;
}) {
  /* Enough tiles to overflow a wide viewport before repeating. */
  const perRow = 6;
  const sequence = Array.from({ length: perRow }, (_, i) => {
    /* Stagger which image each row starts on, so rows don't line up. */
    const idx = (row * 3 + i) % tiles.length;
    return { src: tiles[idx], key: `${row}-${i}` };
  });

  return (
    <div
      className={`flex h-full w-max hero-marquee-track hero-marquee-track--${dir}`}
      style={{ animationDuration: `${speed}s`, animationDelay: delay }}
    >
      {[0, 1].map((copy) =>
        sequence.map(({ src, key }, i) => (
          <div
            key={`${copy}-${key}`}
            className="shrink-0 h-full overflow-hidden"
            style={{ width: tileWidth }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                /* Vary the crop per tile so repeats aren't obvious */
                objectPosition: `${((row * perRow + i) * 37) % 100}% 45%`,
                filter,
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}
