import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Meant to be triggered periodically (e.g. hourly) by the same external cron
// pinger used for /api/cron/publish (see cron-job.org setup in the README).
// Finds interviews happening within the next 24 hours that haven't had a
// reminder sent yet, emails the user, and marks them as reminded.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcoming = await prisma.application.findMany({
    where: {
      interviewAt: { gte: now, lte: in24h },
      reminderSent: false,
    },
    include: { user: true },
  });

  const results = [];

  for (const app of upcoming) {
    try {
      if (!app.user.email) {
        throw new Error("User has no email on file - skipping reminder");
      }
      await sendEmail({
        to: app.user.email,
        subject: `Reminder: interview for ${app.jobTitle} at ${app.company}`,
        html: `
          <p>Hi ${app.user.name || "there"},</p>
          <p>Just a heads up — your interview for <strong>${app.jobTitle}</strong> at
          <strong>${app.company}</strong> is coming up on
          <strong>${new Date(app.interviewAt).toLocaleString()}</strong>.</p>
          <p>Good luck!</p>
          <p style="color:#888;font-size:12px;">— Career Console</p>
        `,
      });
      await prisma.application.update({
        where: { id: app.id },
        data: { reminderSent: true },
      });
      results.push({ id: app.id, sent: true });
    } catch (err) {
      results.push({ id: app.id, sent: false, error: String(err.message || err) });
    }
  }

  return NextResponse.json({ checked: upcoming.length, results });
}
