import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import JobsClient from "./JobsClient";

export default async function JobsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            Job <span className="grad-text">Leads</span>
          </h1>
          <p className="hero-sub">
            Live listings pulled from Jooble, Adzuna and RemoteOK. Review each one and apply
            yourself through the original posting &mdash; save the ones you like to
            your tracker to follow up later.
          </p>
          <JobsClient />
        </div>
      </div>
    </>
  );
}
