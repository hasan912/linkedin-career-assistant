import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { generateText, parseJsonResponse } from "@/lib/ai";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { resume, jobDescription } = await request.json();
  if (!resume?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "Both resume and job description are required" }, { status: 400 });
  }

  const system =
    "You are an ATS (applicant tracking system) and career-fit analyst. Compare the given resume " +
    "against the given job description. Respond with ONLY valid JSON (no markdown fences, no other text) " +
    'in exactly this shape: {"score": <integer 0-100>, "summary": "<one or two sentence assessment>", ' +
    '"missingKeywords": ["keyword1", "keyword2", ...], "strengths": ["strength1", "strength2", ...]}. ' +
    "missingKeywords should be important skills/terms from the job description that are absent or weak in the resume " +
    "(max 8). strengths should be genuine matches between the resume and the role (max 5).";

  const prompt = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`;

  try {
    const text = await generateText(prompt, { system, maxTokens: 700 });
    const result = parseJsonResponse(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Resume match failed:", err);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
