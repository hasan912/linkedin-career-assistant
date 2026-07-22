import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rateLimitResponse } from "@/lib/ratelimit";
import { createCalendarEvent } from "@/lib/google-calendar";
import { encrypt } from "@/lib/encryption";

// Adds an application's interview to the user's Google Calendar.
export async function POST(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("write", userId);
  if (blocked) return blocked;

  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application || application.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (!application.interviewAt) {
    return NextResponse.json(
      { error: "Set an interview date & time before syncing to your calendar." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken: true, googleRefreshToken: true },
  });

  if (!user?.googleAccessToken) {
    return NextResponse.json({ error: "Google not connected", needsAuth: true }, { status: 400 });
  }

  const start = application.interviewAt;
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1-hour block

  try {
    const { eventId, refreshedAccessToken, refreshedExpires } = await createCalendarEvent({
      accessToken: user.googleAccessToken,
      refreshToken: user.googleRefreshToken,
      title: `Interview: ${application.jobTitle} @ ${application.company}`,
      description:
        `Interview for ${application.jobTitle} at ${application.company}.` +
        (application.jobUrl ? `\n\nJob posting: ${application.jobUrl}` : "") +
        (application.notes ? `\n\nNotes:\n${application.notes}` : ""),
      startTime: start,
      endTime: end,
    });

    // Persist the event id, plus a refreshed access token if one was minted.
    await prisma.application.update({ where: { id }, data: { googleCalEventId: eventId } });

    if (refreshedAccessToken) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: encrypt(refreshedAccessToken),
          googleTokenExpires: refreshedExpires,
        },
      });
    }

    return NextResponse.json({ ok: true, eventId });
  } catch (err) {
    console.error("Calendar sync failed:", err);
    return NextResponse.json(
      { error: "Couldn't add the event to Google Calendar. Try reconnecting your account." },
      { status: 500 }
    );
  }
}
