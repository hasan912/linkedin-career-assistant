import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import ApplicationsClient from "./ApplicationsClient";

export default async function ApplicationsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            Applications <span className="grad-text">Tracker</span>
          </h1>
          <p className="hero-sub">
            Every lead you&rsquo;re pursuing, in one pipeline. Update status as you move
            from saved to applied to interview.
          </p>
          <ApplicationsClient />
        </div>
      </div>
    </>
  );
}
