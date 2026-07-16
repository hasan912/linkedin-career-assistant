import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import ApplicationsClient from "./ApplicationsClient";

export default async function ApplicationsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <div className="shell">
      <Nav />
      <h1 className="hero" style={{ fontSize: 28 }}>Applications</h1>
      <p className="hero-sub">
        Every lead you're pursuing, in one pipeline. Update status as you move
        from saved to applied to interview.
      </p>
      <ApplicationsClient />
    </div>
  );
}
