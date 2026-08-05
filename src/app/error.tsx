"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-6">
          Error
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
          Something went <span className="gradient-text">wrong</span>
        </h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          We hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="gradient-fill-btn px-7 py-3.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-500/10"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
