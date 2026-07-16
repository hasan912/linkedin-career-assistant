import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import JobsClient from "./JobsClient";

export default async function JobsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <div className="shell">
      <Nav />
      <h1 className="hero" style={{ fontSize: 28 }}>Job Leads</h1>
      <p className="hero-sub">
        Live listings pulled from Adzuna and RemoteOK. Review each one and apply
        yourself through the original posting &mdash; save the ones you like to
        your tracker to follow up later.
      </p>
      <JobsClient />
    </div>
  );
}
