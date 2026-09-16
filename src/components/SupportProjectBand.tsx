"use client";

import Link from "next/link";

/**
 * "Want to support directly this project?" — the full-bleed band that closes
 * a project page. Figma `Frame 483`: on Read details (809:3571) it is 701
 * tall with 120 of padding; on Studio details (704:1278) 661 with 100.
 *
 * Base #0D0D0D with the photo at mix-blend-luminosity / 5% — texture, not
 * content, so it is never colourised. A centred heading block, then a 600px
 * one-time-donation card.
 *
 * `href` is where the button goes. A film or studio page passes its
 * `/support?fundType=…` link so the gift is attributed to the project; an
 * article has no fund of its own and goes to `/support` plainly.
 */

const BODY =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";

export default function SupportProjectBand({
  href,
  imageSrc,
  paddingY = 120,
}: {
  href: string;
  imageSrc?: string;
  paddingY?: 100 | 120;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0D0D0D]" />
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-5"
        />
      )}

      {/* Content — gap 80 between the heading block and the card */}
      <div
        className="relative max-w-[1227px] mx-auto px-5 sm:px-8 xl:px-0 flex flex-col gap-[80px] items-center"
        style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      >
        {/* Heading block — gap 30, inner gap 14, centred */}
        <div className="flex flex-col gap-[30px] w-full text-center">
          <div className="flex flex-col gap-[14px] w-full">
            <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">Support</p>
            <h2 className="font-semibold text-[30px] leading-[34px] sm:text-[38px] sm:leading-[40px] tracking-[-0.57px] text-white">
              Want to support directly this project?
            </h2>
          </div>
          <p className={BODY}>
            Independent political film doesn&rsquo;t pay for itself. Your support keeps the work free of
            editorial strings.
          </p>
        </div>

        {/* One-time card — w 600, blur 3px, 1.5px hairline. The frame sits it
            in a 249px row, which is exactly its own height: py 36.5 there is
            py 35 here, because the hairline is inside the box in CSS. */}
        <div
          className="w-full max-w-[600px] rounded-[6px] border-[1.5px] border-[rgba(240,240,240,0.1)] backdrop-blur-[3px] px-[41.5px] py-[35px] flex flex-col gap-[30px]"
          style={{
            backgroundColor: "rgba(19,19,19,0.6)",
            boxShadow: "0px 6px 20px 0px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex flex-col gap-[10px] items-start w-full">
            <div className="flex flex-col gap-[14px] items-start w-full">
              <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[rgba(255,255,255,0.25)]">
                One-time
              </p>
              <p className="font-semibold text-[26px] leading-[26px] tracking-[-0.75px] text-white">
                Support our work
              </p>
            </div>
            <p className={`${BODY} min-h-[28px]`}>A single contribution, any amount, your project of choice.</p>
          </div>

          <Link
            href={href}
            className="h-[44px] w-full rounded-[3px] border border-[rgba(240,240,240,0.2)] bg-[rgba(54,54,54,0.1)] flex items-center justify-center gap-[7px] text-[13px] leading-[16px] font-medium text-[#F0F0F0] hover:bg-[rgba(54,54,54,0.25)] transition-colors"
          >
            Support this project
            <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor" aria-hidden>
              <path d="M6 10.4S0 6.9 0 3.4A3.1 3.1 0 016 2a3.1 3.1 0 016 1.4c0 3.5-6 7-6 7z" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
