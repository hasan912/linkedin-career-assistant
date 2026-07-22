import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { generateText, parseJsonResponse } from "@/lib/ai";
import { rateLimitResponse } from "@/lib/ratelimit";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("ai", userId);
  if (blocked) return blocked;

  const { jobTitle, location, experienceYears } = await request.json();
  if (!jobTitle?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "Job title and location are required" }, { status: 400 });
  }
  const years = Number.isFinite(experienceYears) ? experienceYears : 0;

  const system =
    "You are a compensation analyst. Estimate a realistic salary range for the given role, location, " +
    "and experience level, drawing on general market knowledge. Respond with ONLY valid JSON (no markdown " +
    "fences, no other text) in exactly this shape: " +
    '{"rangePKR": {"min": <int>, "mid": <int>, "max": <int>}, ' +
    '"rangeUSD": {"min": <int>, "mid": <int>, "max": <int>}, ' +
    '"context": "<1-2 sentence market context>", ' +
    '"tips": ["<tip 1>", "<tip 2>", "<tip 3>"], ' +
    '"disclaimer": "<short note>"}. ' +
    "rangePKR values are annual gross salary in Pakistani Rupees; rangeUSD are annual gross in US Dollars — " +
    "both as plain integers with no commas, currency symbols, or units. tips must be exactly 3 concrete " +
    "negotiation talking points specific to this role and location. The disclaimer must make clear this is " +
    "an estimate based on general knowledge, not guaranteed.";

  const prompt =
    `Role: ${jobTitle}\nLocation: ${location}\nYears of experience: ${years}`;

  try {
    const text = await generateText(prompt, { system, maxTokens: 700 });
    const result = parseJsonResponse(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Salary insights failed:", err);
    return NextResponse.json({ error: err.message || "Estimate failed" }, { status: 500 });
  }
}
