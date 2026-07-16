import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <div className="shell">
      <div className="topbar">
        <div className="wordmark">Career<span className="dot">•</span>Console</div>
      </div>

      <h1 className="hero">Your job search, run on rails.</h1>
      <p className="hero-sub">
        Schedule LinkedIn posts ahead of time, keep a live feed of web
        developer job leads, and track every application in one place.
      </p>

      <a href="/api/auth/linkedin/login" className="btn">
        Continue with LinkedIn
      </a>

      <div className="card" style={{ marginTop: 40, maxWidth: 520 }}>
        <div className="card-title">What this does</div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--paper-dim)", margin: 0 }}>
          Posts are published only through LinkedIn's official API, at the time you
          schedule them. Job leads are pulled from public job board APIs so you can
          review and apply yourself &mdash; this app never auto-applies or auto-messages
          on your behalf, since that would violate LinkedIn's terms of service and risk
          your account.
        </p>
      </div>
    </div>
  );
}
