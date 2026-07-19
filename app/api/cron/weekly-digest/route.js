import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    include: {
      posts: { where: { postedAt: { gte: new Date(Date.now() - 7 * 86400000) } } },
      applications: { where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } },
    },
  });

  const digestResults = [];
  const expiryResults = [];

  for (const user of users) {
    // ── Token expiry warning (5 days before) ──────────────────────────────
    const daysLeft = Math.ceil((new Date(user.tokenExpires) - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 5) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Career Console: LinkedIn session expiring soon",
          html: `<p>Hi ${user.name || "there"},</p>
<p>Your LinkedIn connection in Career Console expires in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>. After that, scheduled posts will fail silently.</p>
<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://linkedin-autopost-smoky.vercel.app"}">Log in again to refresh it →</a></p>
<p style="color:#888;font-size:12px">— Career Console</p>`,
        });
        expiryResults.push({ userId: user.id, daysLeft, sent: true });
      } catch (e) {
        expiryResults.push({ userId: user.id, daysLeft, sent: false, error: e.message });
      }
    }

    // ── Weekly digest ─────────────────────────────────────────────────────
    if (!user.digestEmail) continue;
    const posted = user.posts.length;
    const saved = user.applications.filter((a) => a.status === "saved").length;
    const applied = user.applications.filter((a) => a.status === "applied").length;
    const interviews = user.applications.filter((a) => a.status === "interview").length;

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Career Console weekly recap",
        html: `<p>Hi ${user.name || "there"}, here's what happened this week:</p>
<table style="border-collapse:collapse;font-size:15px">
  <tr><td style="padding:6px 16px 6px 0">📢 Posts published</td><td><strong>${posted}</strong></td></tr>
  <tr><td style="padding:6px 16px 6px 0">💾 Jobs saved</td><td><strong>${saved}</strong></td></tr>
  <tr><td style="padding:6px 16px 6px 0">✉️ Applications sent</td><td><strong>${applied}</strong></td></tr>
  <tr><td style="padding:6px 16px 6px 0">🗓️ Interviews</td><td><strong>${interviews}</strong></td></tr>
</table>
<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://linkedin-autopost-smoky.vercel.app"}/dashboard">Open Career Console →</a></p>
<p style="color:#888;font-size:12px">— Career Console · <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://linkedin-autopost-smoky.vercel.app"}/dashboard/settings">unsubscribe</a></p>`,
      });
      digestResults.push({ userId: user.id, sent: true });
    } catch (e) {
      digestResults.push({ userId: user.id, sent: false, error: e.message });
    }
  }

  return NextResponse.json({ digests: digestResults, expiryWarnings: expiryResults });
}
