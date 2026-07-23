import Link from "next/link";
import "../globals.css";

export const metadata = {
  title: "Legal · Career Console",
  description: "Terms of Service and Privacy Policy for Career Console.",
};

export default function LegalLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#14181C",
        color: "var(--paper)",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--paper)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: 15,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--signal), var(--accent))",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              CC
            </span>
            Career<span style={{ color: "var(--signal-bright)" }}>Console</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "48px 24px 64px" }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "var(--paper-dim)",
          }}
        >
          <span>© 2026 Career Console</span>
          <nav style={{ display: "flex", gap: 20 }}>
            <Link href="/" style={{ color: "var(--paper-dim)", textDecoration: "none" }}>
              Home
            </Link>
            <Link href="/terms" style={{ color: "var(--paper-dim)", textDecoration: "none" }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ color: "var(--paper-dim)", textDecoration: "none" }}>
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
