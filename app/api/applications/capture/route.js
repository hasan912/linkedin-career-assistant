import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/encryption";
import { rateLimitResponse } from "@/lib/ratelimit";

// CORS: the extension's popup page (origin chrome-extension://<id>) calls this
// directly. We allow it broadly since auth is via a per-user Bearer token
// (not cookies), so a permissive Access-Control-Allow-Origin carries no CSRF risk.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json(
      { error: "Missing API token. Set it up in the extension's options page." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const user = await prisma.user.findUnique({ where: { apiTokenHash: hashToken(token) } });
  if (!user) {
    return NextResponse.json(
      { error: "Invalid API token." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const blocked = await rateLimitResponse("write", user.id);
  if (blocked) return blocked;

  const { jobTitle, company, jobUrl } = await request.json();
  if (!jobTitle) {
    return NextResponse.json(
      { error: "jobTitle is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobTitle,
      company: company || "Unknown",
      jobUrl: jobUrl || null,
      status: "saved",
    },
  });

  return NextResponse.json({ ok: true, application }, { headers: CORS_HEADERS });
}
