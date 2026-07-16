import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import PostsClient from "./PostsClient";

export default async function PostsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <div className="shell">
      <Nav />
      <h1 className="hero" style={{ fontSize: 28 }}>Scheduled Posts</h1>
      <p className="hero-sub">
        Write once, publish automatically. A background job checks every 15
        minutes and publishes anything that's due, straight to your LinkedIn feed.
      </p>
      <PostsClient />
    </div>
  );
}
