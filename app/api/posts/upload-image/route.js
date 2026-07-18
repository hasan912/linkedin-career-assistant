import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { uploadLinkedInImage } from "@/lib/linkedin";
import { decrypt } from "@/lib/encryption";
import { rateLimitResponse } from "@/lib/ratelimit";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("upload", userId);
  if (blocked) return blocked;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || new Date(user.tokenExpires) < new Date()) {
    return NextResponse.json(
      { error: "Your LinkedIn session has expired. Please log in again." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or GIF images are supported" },
      { status: 400 }
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrn = await uploadLinkedInImage({
      accessToken: decrypt(user.accessToken),
      authorSub: user.linkedinSub,
      fileBuffer: buffer,
      contentType: file.type,
    });
    return NextResponse.json({ imageUrn });
  } catch (err) {
    console.error("Image upload failed:", err);
    return NextResponse.json(
      { error: "Couldn't upload the image to LinkedIn. Try again." },
      { status: 500 }
    );
  }
}
