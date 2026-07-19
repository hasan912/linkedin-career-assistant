import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Typewriter from "@/components/Typewriter";

const FEATURES = [
  {
    title: "AI Post Generator",
    body: "Turn a topic and a tone into a polished LinkedIn post, then schedule it to publish automatically through LinkedIn's official API.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
        <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </svg>
    ),
  },
  {
    title: "Smart Job Tracker",
    body: "Pull live listings from Jooble, Adzuna and RemoteOK, save the good ones, and move every application through a clean pipeline.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2.5" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        <path d="M3 12.5h18" />
      </svg>
    ),
  },
  {
    title: "Resume Analyzer",
    body: "Score your resume against any job description, surface missing keywords, and draft a tailored cover letter in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2.5h8L19 7.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-16A1.5 1.5 0 0 1 6.5 2.5Z" />
        <path d="M14 2.5V8h5" />
        <path d="M9 13l2 2 4-4.5" />
      </svg>
    ),
  },
];

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Animated gradient wash */}
      <div
        aria-hidden="true"
        className="animate-gradient pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(115deg, rgba(78,140,130,0.22), rgba(99,102,241,0.16) 45%, rgba(147,51,234,0.14) 70%, rgba(78,140,130,0.18))",
          backgroundSize: "300% 300%",
        }}
      />
      {/* Glow orbs */}
      <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-32 left-1/4 h-105 w-105 rounded-full bg-signal/20 blur-[120px]" />
      <div aria-hidden="true" className="animate-float pointer-events-none absolute right-1/5 top-40 h-90 w-90 rounded-full bg-accent/20 blur-[120px]" style={{ animationDelay: "-3.5s" }} />
      {/* Dot grid overlay */}
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Top bar */}
        <header className="flex items-center justify-between py-7">
          <div className="flex items-center gap-3">
            <span className="avatar h-9 w-9 rounded-xl text-sm">CC</span>
            <span className="text-[15px] font-extrabold tracking-tight">
              Career<span className="grad-text">Console</span>
            </span>
          </div>
          <a
            href="/api/auth/linkedin/login"
            className="rounded-full border border-border-strong bg-white/5 px-5 py-2 text-[13px] font-semibold text-paper no-underline backdrop-blur-xl transition-colors duration-200 hover:border-signal hover:text-signal-bright"
          >
            Sign in
          </a>
        </header>

        {/* Hero */}
        <section className="flex min-h-[72vh] flex-col items-center justify-center pb-16 pt-10 text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-white/5 px-4 py-1.5 text-[12px] font-semibold text-paper-dim backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Built on LinkedIn&rsquo;s official API — no scraping, ever
          </div>

          <h1 className="animate-fade-up m-0 max-w-4xl text-[clamp(42px,7vw,80px)] font-black leading-[1.05] tracking-[-0.03em]" style={{ animationDelay: "0.08s" }}>
            Your Career,{" "}
            <span className="grad-text">On Autopilot</span>
          </h1>

          <p className="animate-fade-up mt-6 min-h-[1.8em] text-[clamp(17px,2.4vw,23px)] font-medium text-paper-dim" style={{ animationDelay: "0.16s" }}>
            <Typewriter />
          </p>

          <div className="animate-fade-up mt-10" style={{ animationDelay: "0.24s" }}>
            <a
              href="/api/auth/linkedin/login"
              className="animate-pulse-glow inline-flex cursor-pointer items-center gap-3 rounded-full bg-linear-to-r from-[#0a66c2] to-[#0e76d3] px-9 py-4 text-[16px] font-bold text-white no-underline transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.99]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
              </svg>
              Connect with LinkedIn
            </a>
            <p className="mt-4 text-[12.5px] text-paper-dim">
              Free to use · Your data stays yours · One-click export anytime
            </p>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-5 pb-24 md:grid-cols-3" aria-label="Features">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="card card-hover animate-fade-up mb-0! p-7"
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <span className="avatar mb-5 flex h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6">
                {f.icon}
              </span>
              <h2 className="m-0 mb-2.5 text-[17px] font-bold tracking-tight">{f.title}</h2>
              <p className="m-0 text-[13.5px] leading-relaxed text-paper-dim">{f.body}</p>
            </article>
          ))}
        </section>

        {/* Footer note */}
        <footer className="border-t border-border pb-10 pt-8 text-center">
          <p className="mx-auto m-0 max-w-2xl text-[12.5px] leading-relaxed text-paper-dim">
            Posts are published only through LinkedIn&rsquo;s official API, at the time you
            schedule them. Job leads come from public job-board APIs so you review and apply
            yourself — this app never auto-applies or auto-messages on your behalf.
          </p>
        </footer>
      </div>
    </main>
  );
}
