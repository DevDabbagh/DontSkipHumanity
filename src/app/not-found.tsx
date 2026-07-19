import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-6">404</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
          Page not <span className="gradient-text">found</span>
        </h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="gradient-fill-btn px-7 py-3.5 rounded-xl text-sm font-medium inline-block shadow-lg shadow-purple-500/10"
          >
            Back to home
          </Link>
          <Link
            href="/films"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Browse films
          </Link>
        </div>
      </div>
    </main>
  );
}
