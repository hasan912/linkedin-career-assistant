import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { jobTitle, company, jobUrl, status, notes } = await request.json();
  if (!jobTitle || !company) {
    return NextResponse.json({ error: "jobTitle and company are required" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      userId,
      jobTitle,
      company,
      jobUrl,
      status: status || "saved",
      notes,
      appliedDate: status === "applied" ? new Date() : null,
    },
  });
  return NextResponse.json(application);
}
