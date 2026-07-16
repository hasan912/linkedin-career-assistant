import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function PATCH(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await request.json();
  const data = {};
  if (body.status) {
    data.status = body.status;
    if (body.status === "applied" && !existing.appliedDate) {
      data.appliedDate = new Date();
    }
  }
  if (body.notes !== undefined) data.notes = body.notes;

  const updated = await prisma.application.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
