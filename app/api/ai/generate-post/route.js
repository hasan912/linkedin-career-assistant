import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { generateText } from "@/lib/ai";
import { rateLimitResponse } from "@/lib/ratelimit";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("ai", userId);
  if (blocked) return blocked;

  const { topic, tone } = await request.json();
  if (!topic || !topic.trim()) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const system =
    "You write LinkedIn posts for a web developer building their professional presence. " +
    "Write in first person. Keep it authentic and specific, not generic corporate-speak. " +
    "Use short paragraphs and occasional line breaks for readability. " +
    "End with 3-5 relevant hashtags on their own line. " +
    "Do not use markdown formatting (no **bold**, no #headers) since LinkedIn doesn't render it. " +
    "Return ONLY the post text, nothing else - no preamble, no quotation marks around it.";

  const toneInstruction = {
    Professional: "Tone: professional and polished.",
    Casual: "Tone: casual and conversational, like talking to a colleague.",
    Storytelling: "Tone: storytelling - open with a small personal anecdote or moment, then draw the lesson out.",
    Technical: "Tone: technical and detailed, aimed at fellow developers.",
  }[tone] || "Tone: professional and polished.";

  const prompt = `Write a LinkedIn post about: ${topic}\n\n${toneInstruction}`;

  try {
    const text = await generateText(prompt, { system, maxTokens: 600 });
    return NextResponse.json({ post: text.trim() });
  } catch (err) {
    console.error("AI post generation failed:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
