import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";

export default async function Dashboard() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pendingPosts = await prisma.post.count({ where: { userId, status: "pending" } });
  const postedCount = await prisma.post.count({ where: { userId, status: "posted" } });
  const applications = await prisma.application.count({ where: { userId } });
  const applied = await prisma.application.count({ where: { userId, status: "applied" } });

  return (
    <div className="shell">
      <Nav />
      <h1 className="hero" style={{ fontSize: 30 }}>
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="hero-sub">Here's where things stand today.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="card">
          <div className="card-title">Posts Waiting to Publish</div>
          <div style={{ fontSize: 32, fontFamily: "var(--font-display)" }}>{pendingPosts}</div>
        </div>
        <div className="card">
          <div className="card-title">Posts Published</div>
          <div style={{ fontSize: 32, fontFamily: "var(--font-display)" }}>{postedCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Total Leads Tracked</div>
          <div style={{ fontSize: 32, fontFamily: "var(--font-display)" }}>{applications}</div>
        </div>
        <div className="card">
          <div className="card-title">Applications Sent</div>
          <div style={{ fontSize: 32, fontFamily: "var(--font-display)" }}>{applied}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <a href="/dashboard/posts" className="btn">Schedule a Post</a>
        <a href="/dashboard/jobs" className="btn btn-ghost">Browse Job Leads</a>
      </div>
    </div>
  );
}
