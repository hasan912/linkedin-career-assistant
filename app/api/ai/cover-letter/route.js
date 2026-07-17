import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { generateText } from "@/lib/ai";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { resume, jobDescription } = await request.json();
  if (!resume?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "Both resume and job description are required" }, { status: 400 });
  }

  const system =
    "You write concise, genuine, non-generic cover letters. Use the candidate's actual resume details " +
    "(specific projects, skills, experience) rather than vague filler phrases. Keep it under 300 words, " +
    "3-4 short paragraphs, professional but human tone. Do not invent facts not present in the resume. " +
    "Return ONLY the cover letter text, no preamble, no markdown, no placeholder brackets like [Company Name] " +
    "unless that information genuinely isn't derivable from the job description.";

  const prompt = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nWrite a tailored cover letter for this application.`;

  try {
    const text = await generateText(prompt, { system, maxTokens: 700 });
    return NextResponse.json({ coverLetter: text.trim() });
  } catch (err) {
    console.error("Cover letter generation failed:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
