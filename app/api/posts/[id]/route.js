import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
