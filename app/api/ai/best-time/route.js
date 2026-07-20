import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { generateText, parseJsonResponse } from "@/lib/ai";
import { rateLimitResponse } from "@/lib/ratelimit";
import { utcToZonedParts } from "@/lib/timezone";

// General best-practice windows used when the user doesn't have enough
// performance data yet (or the AI response can't be parsed).
const DEFAULT_SLOTS = [
  { day: "Tuesday", time: "09:00", reason: "Mid-week mornings get the highest LinkedIn engagement" },
  { day: "Wednesday", time: "08:30", reason: "Professionals check LinkedIn before starting their day" },
  { day: "Thursday", time: "17:30", reason: "End-of-day scroll before the weekend wind-down" },
];

const DEFAULT_SUGGESTION =
  "Not enough performance data yet - log engagement on a few more posts for personalized timing. " +
  "Until then: Tuesday-Thursday, 8-10am or 5-6pm (Pakistan time) are LinkedIn's strongest windows.";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("ai", userId);
  if (blocked) return blocked;

  const posts = await prisma.post.findMany({
    where: { userId, status: "posted" },
    orderBy: { postedAt: "desc" },
    take: 20,
    include: {
      performances: { orderBy: { loggedAt: "desc" }, take: 1 },
    },
  });

  const withPerf = posts.filter((p) => p.performances.length > 0);
  if (withPerf.length < 5) {
    return NextResponse.json({
      suggestion: DEFAULT_SUGGESTION,
      slots: DEFAULT_SLOTS,
      source: "default",
    });
  }

  // Build "Tuesday 09:00 -> 1250 impressions" lines, with day/hour expressed in
  // the timezone each post was scheduled in (that's the audience-relevant time).
  const lines = withPerf.map((p) => {
    const when = p.postedAt || p.scheduledFor;
    const { hour24, minute } = utcToZonedParts(when, p.timeZone);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: p.timeZone, weekday: "long" }).format(when);
    const perf = p.performances[0];
    return `${weekday} ${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")} -> ${perf.impressions} impressions (${perf.likes} likes, ${perf.comments} comments, ${perf.shares} shares)`;
  });

  const system =
    "You analyze LinkedIn post timing data. Respond with ONLY valid JSON, no prose, no code fences. " +
    'Schema: {"suggestion": string, "slots": [{"day": string, "time": string, "reason": string}]}. ' +
    '"day" must be a full English weekday name (e.g. "Tuesday"). "time" must be 24h "HH:MM". ' +
    "Exactly 3 slots. suggestion is 1-2 sentences summarizing the pattern you found.";

  const prompt =
    "Here is when my LinkedIn posts were published and how they performed:\n\n" +
    lines.join("\n") +
    "\n\nIdentify which day/time slots performed best and suggest 3 optimal posting windows.";

  try {
    const text = await generateText(prompt, { system, maxTokens: 500 });
    const parsed = parseJsonResponse(text);
    const slots = Array.isArray(parsed.slots)
      ? parsed.slots
          .filter((s) => s && DAY_NAMES.includes(s.day) && /^\d{2}:\d{2}$/.test(s.time || ""))
          .slice(0, 3)
      : [];
    if (typeof parsed.suggestion !== "string" || slots.length !== 3) {
      throw new Error("AI response didn't match the expected shape");
    }
    return NextResponse.json({ suggestion: parsed.suggestion, slots, source: "ai" });
  } catch (err) {
    console.error("Best-time analysis failed, using defaults:", err);
    return NextResponse.json({
      suggestion: DEFAULT_SUGGESTION,
      slots: DEFAULT_SLOTS,
      source: "default",
    });
  }
}
