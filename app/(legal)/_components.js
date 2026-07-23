// Shared presentational helpers for the legal pages.
// Underscore prefix keeps this out of the App Router (private folder/file).

export function LegalPage({ title, updated, toc, children }) {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto" }}>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 12.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--paper-dim)",
        }}
      >
        Last updated: July 2026
      </p>
      <h1
        style={{
          margin: "0 0 12px",
          fontSize: "clamp(30px, 5vw, 42px)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {updated ? (
        <p style={{ margin: "0 0 28px", color: "var(--paper-dim)", fontSize: 15 }}>{updated}</p>
      ) : null}

      {/* Table of contents */}
      <nav
        aria-label="Table of contents"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          padding: "20px 24px",
          margin: "0 0 40px",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--paper-dim)",
          }}
        >
          On this page
        </p>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: 8,
            counterReset: "toc",
          }}
        >
          {toc.map(({ id, label }) => (
            <li key={id} style={{ margin: 0 }}>
              <a
                href={`#${id}`}
                style={{
                  color: "var(--signal-bright)",
                  textDecoration: "none",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {children}
    </article>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} style={{ scrollMarginTop: 24, margin: "0 0 34px" }}>
      <h2
        style={{
          margin: "0 0 14px",
          paddingLeft: 14,
          borderLeft: "3px solid var(--signal)",
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "var(--paper)",
          fontSize: 15.5,
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </section>
  );
}

// Consistent styling for paragraphs / lists inside a Section.
export const p = { margin: "0 0 14px", color: "var(--paper)" };
export const ul = {
  margin: "0 0 14px",
  paddingLeft: 22,
  color: "var(--paper)",
  display: "grid",
  gap: 8,
};
export const muted = { color: "var(--paper-dim)" };
