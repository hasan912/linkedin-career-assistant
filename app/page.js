import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";

/* ------------------------------------------------------------------ data */

const FEATURES = [
  {
    icon: "📅",
    title: "LinkedIn Post Scheduler",
    body: "Write posts, pick a date/time, Career Console publishes automatically via LinkedIn's official Posts API at the scheduled time.",
  },
  {
    icon: "📋",
    title: "Job Application Tracker",
    body: "Track applications through a visual pipeline: Saved → Applied → Interview → Offer → Rejected. Set interview dates and receive email reminders.",
  },
  {
    icon: "🤖",
    title: "AI Post Generator",
    body: "Enter a topic and tone, AI drafts a LinkedIn post with relevant hashtags ready to schedule.",
  },
  {
    icon: "📄",
    title: "Resume vs Job Description Analyzer",
    body: "Paste your resume and a job description, get a compatibility score and missing keywords.",
  },
  {
    icon: "✍️",
    title: "AI Cover Letter Generator",
    body: "Generate a tailored cover letter based on your resume and the specific job description.",
  },
  {
    icon: "💼",
    title: "Live Job Leads",
    body: "Browse web development jobs from Jooble, Adzuna, and RemoteOK. Save leads to your tracker.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    body: "Track your application response rate, weekly progress, and daily goals.",
  },
  {
    icon: "🌐",
    title: "Public Portfolio Page",
    body: "Create a public profile page at careerconsole.vercel.app/p/username to share with recruiters.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Connect LinkedIn",
    body: "Sign in securely with your LinkedIn account — no separate password needed.",
  },
  {
    num: "2",
    title: "Write & Schedule Posts",
    body: "Compose posts with AI assistance and schedule them to publish automatically.",
  },
  {
    num: "3",
    title: "Track Applications",
    body: "Add job leads from live listings, track every stage from Saved to Offer.",
  },
  {
    num: "4",
    title: "Use AI Tools",
    body: "Analyze resumes, generate cover letters, and build your public portfolio.",
  },
];

/* ------------------------------------------------------------------ page */

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-ink"
      style={{ fontFamily: "var(--font-body)" }}
    >
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
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute -top-32 left-1/4 h-105 w-105 rounded-full bg-signal/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute right-1/5 top-40 h-90 w-90 rounded-full bg-accent/20 blur-[120px]"
        style={{ animationDelay: "-3.5s" }}
      />
      {/* Dot grid overlay */}
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ============================================================
            SECTION 1 — Header / Nav
        ============================================================= */}
        <header className="flex items-center justify-between py-7">
          <div className="flex items-center gap-3">
            <span className="avatar h-9 w-9 rounded-xl text-sm">CC</span>
            <span
              className="text-[15px] font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Career<span className="grad-text">Console</span>
            </span>
          </div>

          <nav
            className="hidden items-center gap-6 text-[13px] font-medium text-paper-dim md:flex"
            aria-label="Main"
          >
            <a
              href="#features"
              className="no-underline transition-colors hover:text-signal-bright"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="no-underline transition-colors hover:text-signal-bright"
            >
              How it Works
            </a>
            <a
              href="/privacy"
              className="no-underline transition-colors hover:text-signal-bright"
            >
              Privacy Policy
            </a>
          </nav>

          <a
            href="/api/auth/linkedin/login"
            className="rounded-full border border-border-strong bg-white/5 px-5 py-2 text-[13px] font-semibold text-paper no-underline backdrop-blur-xl transition-colors duration-200 hover:border-signal hover:text-signal-bright"
          >
            Sign in with LinkedIn
          </a>
        </header>

        {/* ============================================================
            SECTION 2 — Hero
        ============================================================= */}
        <section className="flex flex-col items-center pb-20 pt-16 text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-white/5 px-4 py-1.5 text-[12px] font-semibold text-paper-dim backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Built on LinkedIn&rsquo;s official API &mdash; no scraping, ever
          </div>

          <h1
            className="animate-fade-up m-0 max-w-4xl text-[clamp(32px,6vw,64px)] font-black leading-[1.08] tracking-[-0.03em]"
            style={{
              animationDelay: "0.08s",
              fontFamily: "var(--font-display)",
            }}
          >
            Career Console &mdash;{" "}
            <span className="grad-text">
              LinkedIn Scheduler &amp; Job Search Tool
            </span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-2xl text-[clamp(15px,2vw,19px)] leading-relaxed text-paper-dim"
            style={{ animationDelay: "0.16s" }}
          >
            Schedule LinkedIn posts with AI, track job applications through a
            visual pipeline, analyze resumes, generate cover letters, and build
            a public portfolio &mdash; all from one dashboard. Free for
            developers and job seekers.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "0.24s" }}
          >
            <a href="/api/auth/linkedin/login" className="btn no-underline">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
              </svg>
              Get Started Free
            </a>
            <a href="/privacy" className="btn btn-ghost no-underline">
              View Privacy Policy
            </a>
          </div>

          <p
            className="animate-fade-up mt-6 max-w-xl text-[12px] leading-relaxed text-paper-dim"
            style={{ animationDelay: "0.32s" }}
          >
            By connecting LinkedIn, you authorize Career Console to publish
            posts on your behalf using LinkedIn&rsquo;s official API. We only
            request access to: your name, email, and the ability to post on your
            profile.
          </p>
        </section>

        {/* ============================================================
            SECTION 3 — What Career Console Does (Features)
        ============================================================= */}
        <section id="features" className="pb-24">
          <h2
            className="mb-4 text-center text-[clamp(24px,4vw,36px)] font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What <span className="grad-text">Career Console</span> Does
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-[15px] leading-relaxed text-paper-dim">
            Everything you need to grow your LinkedIn presence and land your
            next role &mdash; in one place.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="card card-hover animate-fade-up mb-0! p-6"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <span className="mb-4 block text-3xl" aria-hidden="true">
                  {f.icon}
                </span>
                <h3 className="m-0 mb-2 text-[15px] font-bold tracking-tight">
                  {f.title}
                </h3>
                <p className="m-0 text-[13px] leading-relaxed text-paper-dim">
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ============================================================
            SECTION 4 — Why We Request LinkedIn Access
        ============================================================= */}
        <section className="pb-24">
          <div className="card mx-auto max-w-3xl p-8 md:p-10">
            <h2
              className="m-0 mb-6 text-center text-[clamp(22px,3.5vw,30px)] font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why We Need{" "}
              <span className="grad-text">LinkedIn Access</span>
            </h2>

            <p className="mb-5 text-[15px] leading-relaxed text-paper-dim">
              Career Console uses LinkedIn&rsquo;s official OAuth to:
            </p>

            <ul className="m-0 mb-6 list-none space-y-3 pl-0 text-[14px] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-success">✓</span>
                <span>
                  Verify your identity securely (no separate password needed)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-success">✓</span>
                <span>
                  Publish posts you schedule &mdash; only when you set a
                  scheduled time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-success">✓</span>
                <span>
                  Access your name and email to personalize your dashboard
                </span>
              </li>
            </ul>

            <div className="mb-6 space-y-2 text-[14px]">
              <p className="m-0 flex items-start gap-3">
                <span className="mt-0.5 text-danger">✕</span>
                <span>
                  We do <strong>NOT</strong> access your connections, messages,
                  or browsing data
                </span>
              </p>
              <p className="m-0 flex items-start gap-3">
                <span className="mt-0.5 text-danger">✕</span>
                <span>
                  We do <strong>NOT</strong> post without your explicit
                  scheduling
                </span>
              </p>
            </div>

            <p className="m-0 mb-5 text-[13px] leading-relaxed text-paper-dim">
              You can revoke access anytime from{" "}
              <strong className="text-paper">
                LinkedIn Settings → Data Privacy → Other applications
              </strong>
              .
            </p>

            <a
              href="/privacy"
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-signal-bright no-underline transition-colors hover:text-accent-bright"
            >
              Read our full Privacy Policy →
            </a>
          </div>
        </section>

        {/* ============================================================
            SECTION 5 — How It Works
        ============================================================= */}
        <section id="how-it-works" className="pb-24">
          <h2
            className="mb-12 text-center text-[clamp(24px,4vw,36px)] font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How It <span className="grad-text">Works</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="animate-fade-up text-center"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <span className="avatar mx-auto mb-5 flex h-12 w-12 rounded-full text-lg">
                  {s.num}
                </span>
                <h3 className="m-0 mb-2 text-[16px] font-bold tracking-tight">
                  {s.title}
                </h3>
                <p className="m-0 text-[13px] leading-relaxed text-paper-dim">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            SECTION 6 — CTA
        ============================================================= */}
        <section className="pb-24 text-center">
          <div className="card mx-auto max-w-2xl p-10">
            <h2
              className="m-0 mb-3 text-[clamp(22px,3.5vw,30px)] font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start free &mdash; no credit card required
            </h2>
            <p className="mx-auto mb-8 max-w-md text-[15px] text-paper-dim">
              Join developers and job seekers using Career Console to automate
              their LinkedIn presence and track their job search.
            </p>

            <a
              href="/api/auth/linkedin/login"
              className="btn no-underline"
              style={{ fontSize: "16px", padding: "14px 32px" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
              </svg>
              Connect with LinkedIn
            </a>

            <p className="mt-5 text-[12px] text-paper-dim">
              By clicking, you agree to our{" "}
              <a
                href="/terms"
                className="text-signal-bright no-underline underline-offset-2 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-signal-bright no-underline underline-offset-2 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>

        {/* ============================================================
            SECTION 7 — Footer
        ============================================================= */}
        <footer className="border-t border-border pb-10 pt-8 text-center">
          <nav
            className="mb-5 flex items-center justify-center gap-5 text-[13px]"
            aria-label="Legal"
          >
            <a
              href="/privacy"
              className="text-paper-dim no-underline transition-colors hover:text-signal-bright"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <a
              href="/terms"
              className="text-paper-dim no-underline transition-colors hover:text-signal-bright"
            >
              Terms of Service
            </a>
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <a
              href="mailto:contact@careerconsole.app"
              className="text-paper-dim no-underline transition-colors hover:text-signal-bright"
            >
              Contact
            </a>
          </nav>

          <p className="mx-auto m-0 mb-3 max-w-2xl text-[12.5px] leading-relaxed text-paper-dim">
            Career Console uses LinkedIn&rsquo;s official API and is not
            affiliated with LinkedIn Corporation.
          </p>
          <p className="m-0 mb-4 text-[12.5px] text-paper-dim">
            Built for developers and job seekers in Pakistan.
          </p>
          <p className="m-0 text-[12px] text-paper-dim">
            © 2026 Career Console
          </p>
        </footer>
      </div>
    </main>
  );
}
