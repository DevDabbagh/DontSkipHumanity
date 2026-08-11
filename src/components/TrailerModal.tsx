"use client";

import { useEffect, useRef, useState } from "react";
import { hasTrailerAccess, submitTrailerAccessRequest } from "@/lib/trailerAccess";

/**
 * On-platform trailer player. Opens in a full-screen dark lightbox — no native
 * browser controls; a single centered play/pause button doubles as both. If
 * the film is `request_only`, a short request form gates the video until
 * submitted (access is then remembered for that visitor).
 * Close with the "Close" button, the backdrop, or Esc.
 *
 * The caller only mounts this component while `open` is true (see
 * `{trailerOpen && <TrailerModal ... />}` in FilmContent) — that fresh mount
 * per open is what resets `playing`/`granted`, so no reset-on-open effect is
 * needed here.
 */
export default function TrailerModal({
  onClose,
  src,
  poster,
  title,
  filmId,
  requiresRequest = false,
}: {
  onClose: () => void;
  src: string;
  poster?: string;
  title?: string;
  filmId?: string;
  requiresRequest?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [granted] = useState(() => !requiresRequest || !filmId || hasTrailerAccess(filmId));
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} — trailer` : "Trailer"}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 sm:top-7 sm:right-7 flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
      >
        Close
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
        {granted || unlocked ? (
          <>
            <div
              className="relative w-full aspect-video rounded-[4px] overflow-hidden border border-white/10 bg-black cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                playsInline
                controlsList="nodownload"
                className="w-full h-full object-contain bg-black"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>

              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  playing ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/90 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            {title && <p className="mt-4 text-[14px] text-white/40">{title}</p>}
          </>
        ) : (
          <TrailerAccessGate filmId={filmId!} filmTitle={title || ""} onGranted={() => setUnlocked(true)} />
        )}
      </div>
    </div>
  );
}

function TrailerAccessGate({
  filmId,
  filmTitle,
  onGranted,
}: {
  filmId: string;
  filmTitle: string;
  onGranted: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitTrailerAccessRequest({
        filmId,
        filmTitle,
        name: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
      });
      onGranted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-[6px] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[11px] tracking-[0.25em] text-white/40 uppercase mb-2">Trailer access</p>
      <h3 className="text-lg font-semibold text-white mb-2">This trailer is restricted</h3>
      <p className="text-[13px] text-white/40 leading-relaxed mb-6">
        {filmTitle ? `"${filmTitle}" is` : "This film is"} still on the festival circuit. Leave your details and
        we&apos;ll let you watch it right away.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full text-sm px-3.5 py-2.5 rounded-[3px] bg-black/40 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full text-sm px-3.5 py-2.5 rounded-[3px] bg-black/40 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Organization (optional)"
          className="w-full text-sm px-3.5 py-2.5 rounded-[3px] bg-black/40 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        {error && <p className="text-[12px] text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full gradient-fill-btn px-5 py-3 rounded-[3px] text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Requesting…" : "Request access & watch"}
        </button>
      </form>
    </div>
  );
}
