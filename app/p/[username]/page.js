import { prisma } from "@/lib/prisma";

// Public page - no auth. Only ever selects non-sensitive fields from users who
// explicitly opted in with isPublic.
async function getPublicUser(username) {
  if (!/^[a-z0-9-]{3,20}$/.test(username)) return null;
  return prisma.user.findFirst({
    where: { username, isPublic: true },
    select: {
      name: true,
      username: true,
      title: true,
      bio: true,
      skills: true,
      portfolioUrl: true,
      githubUrl: true,
      linkedinUrl: true,
    },
  });
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await getPublicUser(username.toLowerCase());
  if (!user) return { title: "Profile not found" };

  const ogTitle = [user.name || user.username, user.title].filter(Boolean).join(" — ");
  const description = user.bio || `${user.name || user.username}'s professional portfolio.`;
  return {
    title: ogTitle,
    description,
    openGraph: { title: ogTitle, description, type: "profile" },
  };
}

function LinkPill({ href, label, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-5 py-2.5 text-[13.5px] font-semibold text-paper no-underline transition-colors duration-200 hover:border-signal hover:text-signal-bright"
    >
      <span className="h-4 w-4 flex-shrink-0">{icon}</span>
      {label}
    </a>
  );
}

const LINKEDIN_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
  </svg>
);

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);

const GLOBE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
  </svg>
);

export default async function PublicPortfolio({ params }) {
  const { username } = await params;
  const user = await getPublicUser(username.toLowerCase());

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
        <span className="avatar mb-6 h-16 w-16 rounded-2xl text-[22px]">?</span>
        <h1 className="hero !mb-3">Profile not found</h1>
        <p className="m-0 max-w-md text-[14.5px] leading-relaxed text-paper-dim">
          This portfolio doesn&rsquo;t exist or isn&rsquo;t public. If it&rsquo;s yours, log in to
          Career Console and flip on &ldquo;Public profile&rdquo; in the Portfolio tab.
        </p>
        <a href="/" className="btn mt-8 no-underline">Go to Career Console</a>
      </main>
    );
  }

  const initial = (user.name || user.username).charAt(0).toUpperCase();

  return (
    <main className="relative  min-h-screen overflow-hidden bg-ink">
      {/* Ambient gradient + glow, same visual language as the landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(115deg, rgba(78,140,130,0.18), rgba(99,102,241,0.12) 45%, transparent 75%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-signal/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Identity */}
        <header className="flex flex-col items-center text-center">
          <span className="avatar h-24 w-24 rounded-3xl text-[34px]">{initial}</span>
          <h1 className="hero !mb-1 mt-6">{user.name || user.username}</h1>
          {user.title && (
            <p className="grad-text m-0 text-[17px] font-bold tracking-tight">{user.title}</p>
          )}
          {user.bio && (
            <p className="m-0 mt-5 max-w-xl text-[15px] leading-relaxed text-paper-dim">{user.bio}</p>
          )}
        </header>

        {/* Skills */}
        {user.skills.length > 0 && (
          <section className="mt-10" aria-label="Skills">
            <div className="card-title text-center">Skills</div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-signal/30 bg-signal/10 px-4 py-1.5 text-[13px] font-semibold text-signal-bright"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Links */}
        <section className="mt-10 flex flex-wrap justify-center gap-3" aria-label="Links">
          {user.linkedinUrl && <LinkPill href={user.linkedinUrl} label="LinkedIn" icon={LINKEDIN_ICON} />}
          {user.githubUrl && <LinkPill href={user.githubUrl} label="GitHub" icon={GITHUB_ICON} />}
          {user.portfolioUrl && <LinkPill href={user.portfolioUrl} label="Portfolio" icon={GLOBE_ICON} />}
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-border pt-8 text-center">
          <a href="/" className="text-[12.5px] font-semibold text-paper-dim no-underline transition-colors duration-200 hover:text-signal-bright">
            Built with Career<span className="grad-text">Console</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
