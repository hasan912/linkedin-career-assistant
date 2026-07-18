import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <div className="shell">
      <Nav />
      <h1 className="hero" style={{ fontSize: 28 }}>Settings</h1>
      <p className="hero-sub">Manage your browser extension access.</p>
      <SettingsClient />
    </div>
  );
}
