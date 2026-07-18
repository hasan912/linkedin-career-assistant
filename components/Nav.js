"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/posts", label: "Scheduled Posts" },
  { href: "/dashboard/jobs", label: "Job Leads" },
  { href: "/dashboard/applications", label: "Applications" },
  { href: "/dashboard/resume-toolkit", label: "Resume Toolkit" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="wordmark">Career<span className="dot">•</span>Console</div>
      <div className="nav">
        {links.map((l) => (
          <a key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
            {l.label}
          </a>
        ))}
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="btn btn-ghost" style={{ marginLeft: 8 }}>
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
