import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import ResumeToolkitClient from "./ResumeToolkitClient";

export default async function ResumeToolkitPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            Resume <span className="grad-text">Toolkit</span>
          </h1>
          <p className="hero-sub">
            Paste your resume and a job description once, then check your match score
            or generate a tailored cover letter — powered by AI.
          </p>
          <ResumeToolkitClient />
        </div>
      </div>
    </>
  );
}
