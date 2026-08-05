"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0D0D0D", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#6b7280", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Critical Error
            </p>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#9ca3af", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
