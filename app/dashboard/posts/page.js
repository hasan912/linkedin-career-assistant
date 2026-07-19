import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import Nav from "@/components/Nav";
import PostsClient from "./PostsClient";

export default async function PostsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  return (
    <>
      <Nav />
      <div className="shell">
        <div className="page">
          <h1 className="hero">
            Scheduled <span className="grad-text">Posts</span>
          </h1>
          <p className="hero-sub">
            Write once, publish automatically. A background job checks every 15
            minutes and publishes anything that&rsquo;s due, straight to your LinkedIn feed.
          </p>
          <PostsClient />
        </div>
      </div>
    </>
  );
}
