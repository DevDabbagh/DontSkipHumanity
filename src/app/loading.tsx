export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase">
          Loading
        </p>
      </div>
    </main>
  );
}
