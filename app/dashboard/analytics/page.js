import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");
  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            <span className="grad-text">Analytics</span>
          </h1>
          <p className="hero-sub">Your job search at a glance — charts, goal tracking, and data export.</p>
          <AnalyticsClient />
        </div>
      </div>
    </>
  );
}
