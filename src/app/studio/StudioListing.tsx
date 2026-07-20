"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { StudioProject } from "@/lib/types";

const FORMAT_LABELS: Record<string, { label: string; color: string }> = {
  docuseries: { label: "Docuseries", color: "bg-indigo-500/20 text-indigo-300" },
  videocast: { label: "Videocast", color: "bg-amber-500/20 text-amber-300" },
  podcast: { label: "Podcast", color: "bg-[#9B59B6]/20 text-[#c084fc]" },
  series: { label: "Series", color: "bg-emerald-500/20 text-emerald-300" },
  other: { label: "Media", color: "bg-gray-500/20 text-gray-300" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ongoing: { label: "Ongoing", color: "border-emerald-500/30 text-emerald-400" },
  complete: { label: "Complete", color: "border-gray-500/30 text-gray-400" },
  upcoming: { label: "Upcoming", color: "border-amber-500/30 text-amber-400" },
};

export default function StudioListing({ projects }: { projects: StudioProject[] }) {
  const sectionRef = useReveal();

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Studio" />

      {/* Hero */}
      <section className="pt-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Studio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight max-w-3xl">
            Everything we produce in audio and video.
            <span className="gradient-text"> Bold, independent media.</span>
          </h1>
          <p className="text-gray-400 mt-5 max-w-2xl leading-relaxed">
            Studio is DSH’s production arm beyond the cinema slate: docuseries, videocasts, podcasts, and series — original audio and video that reclaims narratives and helps movements grow.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" ref={sectionRef}>
        {/* Studio grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 pb-20 mt-8">
          {projects.map((project, i) => {
            const format = FORMAT_LABELS[project.format] || FORMAT_LABELS.other;
            const status = STATUS_LABELS[project.status];
            
            return (
              <Link
                key={project.slug}
                href={`/studio/${project.slug}`}
                className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Top tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${format.color} backdrop-blur-sm`}>
                      {format.label}
                    </span>
                  </div>

                  {/* Bottom tags (status) */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color} bg-black/40 backdrop-blur-md`}>
                      {status.label}
                    </span>
                  </div>
                  
                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-[#9B59B6]">
                  {project.credits.year} · {project.episodes.length} Episodes
                </p>
                <h3 className="text-xl font-bold text-white mt-1.5 group-hover:text-gray-200 transition-colors">{project.title}</h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">{project.synopsisShort}</p>
                <p className="text-xs text-gray-500 mt-3">With {project.credits.hosts.join(", ")}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
