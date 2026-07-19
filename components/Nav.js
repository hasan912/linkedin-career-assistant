"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ICONS = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  posts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  ),
  jobs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3 12.5h18" />
    </svg>
  ),
  applications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5v1" />
      <path d="M9 10h6M9 14h6M9 18h3.5" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2.5h8L19 7.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-16A1.5 1.5 0 0 1 6.5 2.5Z" />
      <path d="M14 2.5V8h5M9 12.5h6M9 16.5h6" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01A1.7 1.7 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </svg>
  ),
};

const links = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/posts", label: "Scheduled Posts", icon: "posts" },
  { href: "/dashboard/jobs", label: "Job Leads", icon: "jobs" },
  { href: "/dashboard/applications", label: "Applications", icon: "applications" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
  { href: "/dashboard/resume-toolkit", label: "Resume Toolkit", icon: "resume" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");
  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Load saved theme + name from server preference
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.error) return;
        if (data.theme) applyTheme(data.theme);
        if (data.name) setUserName(data.name);
      })
      .catch(() => {});
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function applyTheme(t) {
    setTheme(t);
    document.body.className = t === "light" ? "theme-light" : "";
  }

  async function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    });
  }

  const initial = (userName || "U").charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <a
        href="/dashboard"
        className="flex items-center gap-3 px-5 pb-6 pt-6 no-underline"
      >
        <span className="avatar h-9 w-9 rounded-xl text-sm">CC</span>
        <span className="font-display text-[15px] font-800 tracking-tight">
          Career<span className="grad-text font-extrabold">Console</span>
        </span>
      </a>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Main">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <a
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold no-underline transition-all duration-200 ease-out " +
                (active
                  ? "bg-gradient-to-r from-signal to-accent text-white shadow-[0_4px_14px_rgba(78,140,130,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "text-paper-dim hover:bg-white/5 hover:text-paper")
              }
            >
              <span
                className={
                  "h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 " +
                  (active ? "text-white" : "text-paper-dim group-hover:text-signal-bright")
                }
              >
                {ICONS[l.icon]}
              </span>
              {l.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom: user + theme + logout */}
      <div className="border-t border-border px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <span className="avatar h-9 w-9 rounded-full text-sm">{initial}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{userName || "Your account"}</div>
            <div className="text-[11px] text-paper-dim">Signed in via LinkedIn</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-white/5 text-paper-dim transition-colors duration-200 hover:border-signal hover:text-signal-bright"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[17px] w-[17px]" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>
          <form action="/api/auth/logout" method="POST" className="flex-1">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-border-strong bg-white/5 px-3 py-2 text-[13px] font-semibold text-paper-dim transition-colors duration-200 hover:border-danger/50 hover:text-danger"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border bg-side lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-side/90 px-4 backdrop-blur-xl lg:hidden">
        <a href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <span className="avatar h-8 w-8 rounded-lg text-xs">CC</span>
          <span className="text-[14px] font-800 tracking-tight">
            Career<span className="grad-text font-extrabold">Console</span>
          </span>
        </a>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-white/5 text-paper transition-colors duration-200 hover:border-signal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
          />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-[280px] border-r border-border bg-side shadow-[var(--shadow-pop)]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-paper-dim transition-colors duration-200 hover:text-paper"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
