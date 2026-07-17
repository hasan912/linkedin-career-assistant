// A small abstraction so the app can use whichever AI provider you have a key
// for, without changing any feature code. Priority order: Anthropic -> Gemini
// (free tier, no card required) -> Groq (free tier, very fast).
//
// Get a free key at:
//   Gemini: https://aistudio.google.com/apikey
//   Groq:   https://console.groq.com/keys
export async function generateText(prompt, { system, maxTokens = 1000 } = {}) {
  if (process.env.ANTHROPIC_API_KEY) {
    return callAnthropic(prompt, system, maxTokens);
  }
  if (process.env.GROQ_API_KEY) {
    return callGroq(prompt, system, maxTokens);
  }
  if (process.env.GEMINI_API_KEY) {
    return callGemini(prompt, system, maxTokens);
  }
  throw new Error(
    "No AI provider configured. Set GROQ_API_KEY (free, fast, stable - https://console.groq.com/keys), " +
    "GEMINI_API_KEY (free but quotas change often - https://aistudio.google.com/apikey), " +
    "or ANTHROPIC_API_KEY in your environment variables."
  );
}

async function callAnthropic(prompt, system, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: system || undefined,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.content.map((b) => b.text || "").join("");
}

async function callGemini(prompt, system, maxTokens) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
}

async function callGroq(prompt, system, maxTokens) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// Strips markdown code fences (```json ... ```) that models sometimes wrap
// JSON responses in, then parses it.
export function parseJsonResponse(text) {
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  return JSON.parse(cleaned);
}
