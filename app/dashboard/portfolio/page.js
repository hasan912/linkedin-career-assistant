import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            <span className="grad-text">Portfolio</span>
          </h1>
          <p className="hero-sub">
            A public, shareable profile page — your name, skills and links at one clean URL.
          </p>
          <PortfolioClient />
        </div>
      </div>
    </>
  );
}
