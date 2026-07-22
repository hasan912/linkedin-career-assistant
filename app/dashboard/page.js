import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const ACTION_ICONS = {
  post: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18M12 13.5v5M9.5 16h5" />
    </svg>
  ),
  lead: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M12 11v5M9.5 13.5h5" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2.5h8L19 7.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-16A1.5 1.5 0 0 1 6.5 2.5Z" />
      <path d="M14 2.5V8h5M9 13l2 2 4-4.5" />
    </svg>
  ),
};

export default async function Dashboard() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pendingPosts = await prisma.post.count({ where: { userId, status: "pending" } });
  const postedCount = await prisma.post.count({ where: { userId, status: "posted" } });
  const applications = await prisma.application.count({ where: { userId } });
  const applied = await prisma.application.count({ where: { userId, status: "applied" } });
  const interviews = await prisma.application.count({ where: { userId, status: "interview" } });
  const offers = await prisma.application.count({ where: { userId, status: "offer" } });
  const upcomingInterviews = await prisma.application.findMany({
    where: { userId, interviewAt: { gte: new Date() } },
    orderBy: { interviewAt: "asc" },
    take: 5,
  });
  const recentApps = await prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, jobTitle: true, company: true, status: true, createdAt: true },
  });
  const recentPosts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, content: true, status: true, createdAt: true },
  });

  // Response rate: (interview + offer) / applied
  const responded = interviews + offers;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

  const stats = [
    {
      label: "Posts Scheduled",
      value: pendingPosts,
      sub: "waiting to publish",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: "Posts Published",
      value: postedCount,
      sub: "on your LinkedIn feed",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
        </svg>
      ),
    },
    {
      label: "Total Applications",
      value: applications,
      sub: `${applied} sent so far`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="4" width="14" height="17" rx="2.5" />
          <path d="M9 10h6M9 14h6M9 18h3.5" />
        </svg>
      ),
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      sub: `${responded} of ${applied} answered`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" />
        </svg>
      ),
    },
  ];

  const activity = [
    ...recentApps.map((a) => ({
      key: `app-${a.id}`,
      when: a.createdAt,
      text: `Tracked "${a.jobTitle}" at ${a.company}`,
      pill: a.status,
      kind: "application",
    })),
    ...recentPosts.map((p) => ({
      key: `post-${p.id}`,
      when: p.createdAt,
      text: `Post drafted: "${p.content.slice(0, 60)}${p.content.length > 60 ? "…" : ""}"`,
      pill: p.status,
      kind: "post",
    })),
  ]
    .sort((a, b) => new Date(b.when) - new Date(a.when))
    .slice(0, 6);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          {/* Welcome header */}
          <p className="m-0 mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-paper-dim">{today}</p>
          <h1 className="hero">
            {greeting()}
            {user?.name ? (
              <>
                , <span className="grad-text">{user.name.split(" ")[0]}</span>
              </>
            ) : ""}
            .
          </h1>
          <p className="hero-sub">Here&rsquo;s where things stand today.</p>

          {/* Public portfolio banner */}
          {user?.isPublic && user?.username && (
            <a
              href={`/p/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 flex items-center gap-3 rounded-2xl border border-signal/35 bg-signal/10 px-5 py-3.5 text-[13.5px] font-semibold text-signal-bright no-underline transition-colors duration-200 hover:border-signal hover:bg-signal/15"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
              </svg>
              Your public profile is live &rarr;
              <span className="ml-auto truncate font-mono text-[12px] font-normal text-paper-dim">/p/{user.username}</span>
            </a>
          )}

          {/* Stats row */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key stats">
            {stats.map((s) => (
              <div
                key={s.label}
                className="card card-hover !mb-0 overflow-hidden after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-signal/60 after:to-transparent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="card-title !mb-3">{s.label}</div>
                    <div className="text-[34px] font-extrabold leading-none tracking-tight">{s.value}</div>
                    <div className="mt-2 text-[12px] text-paper-dim">{s.sub}</div>
                  </div>
                  <span className="avatar flex h-11 w-11 rounded-xl [&>svg]:h-[22px] [&>svg]:w-[22px]">{s.icon}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Quick actions */}
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Quick actions">
            {[
              { href: "/dashboard/posts", label: "Schedule Post", icon: ACTION_ICONS.post },
              { href: "/dashboard/applications", label: "Add Job Lead", icon: ACTION_ICONS.lead },
              { href: "/dashboard/resume-toolkit", label: "Analyze Resume", icon: ACTION_ICONS.resume },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="btn !justify-start !py-3.5 text-[14px] no-underline [&>svg]:h-5 [&>svg]:w-5"
              >
                {a.icon}
                {a.label}
              </a>
            ))}
          </section>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Upcoming interviews timeline */}
            <section aria-label="Upcoming interviews">
              <div className="card-title">Upcoming Interviews</div>
              {upcomingInterviews.length === 0 ? (
                <div className="empty !py-9">No interviews scheduled yet — keep applying.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingInterviews.map((a) => (
                    <article
                      key={a.id}
                      className="card card-hover !mb-0 flex items-center gap-4 border-l-[3px] !border-l-warn !py-4"
                    >
                      <span className="avatar h-11 w-11 rounded-xl text-[16px]">
                        {a.company.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14.5px] font-bold">{a.jobTitle}</div>
                        <div className="truncate text-[12.5px] text-paper-dim">{a.company}</div>
                      </div>
                      <time
                        dateTime={new Date(a.interviewAt).toISOString()}
                        className="rounded-lg border border-warn/30 bg-warn/10 px-2.5 py-1.5 text-right text-[11.5px] font-bold leading-tight text-warn"
                      >
                        {new Date(a.interviewAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        <br />
                        <span className="font-semibold opacity-80">
                          {new Date(a.interviewAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </time>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Recent activity */}
            <section aria-label="Recent activity">
              <div className="card-title">Recent Activity</div>
              {activity.length === 0 ? (
                <div className="empty !py-9">Nothing yet — schedule a post or save a job lead to get started.</div>
              ) : (
                <div className="card !mb-0 !p-2">
                  {activity.map((item, i) => (
                    <div
                      key={item.key}
                      className={
                        "flex items-center gap-3 rounded-xl px-4 py-3 " +
                        (i % 2 === 1 ? "bg-white/[0.025]" : "")
                      }
                    >
                      <span
                        className={
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border " +
                          (item.kind === "post"
                            ? "border-accent/30 bg-accent/10 text-accent-bright"
                            : "border-signal/30 bg-signal/10 text-signal-bright")
                        }
                      >
                        {item.kind === "post" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <rect x="3" y="7" width="18" height="13" rx="2.5" />
                            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
                          </svg>
                        )}
                      </span>
                      <p className="m-0 min-w-0 flex-1 truncate text-[13px]">{item.text}</p>
                      <span className="meta flex-shrink-0">
                        {new Date(item.when).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
