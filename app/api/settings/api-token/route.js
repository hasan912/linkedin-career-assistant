import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { hashToken } from "@/lib/encryption";

// GET: just reports whether a token has been generated (never returns the
// actual token, since only its hash is stored).
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ hasToken: !!user?.apiTokenHash });
}

// POST: generates a new token, invalidating any previous one. The raw token
// is returned exactly once - the user must copy it into the extension's
// options page immediately, since it can't be retrieved again afterward.
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rawToken = crypto.randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: { apiTokenHash: hashToken(rawToken) },
  });

  return NextResponse.json({ token: rawToken });
}
