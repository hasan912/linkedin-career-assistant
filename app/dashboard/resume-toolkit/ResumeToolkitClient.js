"use client";

import { useState } from "react";

export default function ResumeToolkitClient() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [matchResult, setMatchResult] = useState(null);

  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);

  function validateInputs(setErrorFn) {
    if (!resume.trim() || !jobDescription.trim()) {
      setErrorFn("Paste both your resume and the job description first.");
      return false;
    }
    return true;
  }

  async function handleAnalyze() {
    setMatchError("");
    setMatchResult(null);
    if (!validateInputs(setMatchError)) return;
    setMatchLoading(true);
    const res = await fetch("/api/ai/match-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, jobDescription }),
    });
    setMatchLoading(false);
    if (res.ok) {
      setMatchResult(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setMatchError(data.error || "Couldn't analyze that. Try again.");
    }
  }

  async function handleGenerateLetter() {
    setLetterError("");
    setCoverLetter("");
    if (!validateInputs(setLetterError)) return;
    setLetterLoading(true);
    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, jobDescription }),
    });
    setLetterLoading(false);
    if (res.ok) {
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } else {
      const data = await res.json().catch(() => ({}));
      setLetterError(data.error || "Couldn't generate that. Try again.");
    }
  }

  function copyLetter() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreColor =
    matchResult?.score >= 75 ? "var(--signal-bright)" : matchResult?.score >= 50 ? "var(--warn)" : "var(--danger)";

  return (
    <>
      <div className="card">
        <div className="card-title">Your resume</div>
        <div className="field" style={{ marginBottom: 0 }}>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here…"
            style={{ minHeight: 180 }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Job description</div>
        <div className="field" style={{ marginBottom: 0 }}>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job posting text here…"
            style={{ minHeight: 180 }}
          />
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginBottom: 24 }}>
        <button className="btn" onClick={handleAnalyze} disabled={matchLoading}>
          {matchLoading ? "Analyzing…" : "Analyze Match"}
        </button>
        <button className="btn btn-ghost" onClick={handleGenerateLetter} disabled={letterLoading}>
          {letterLoading ? "Writing…" : "Generate Cover Letter"}
        </button>
      </div>

      {matchError && (
        <div className="card" style={{ borderColor: "var(--danger)" }}>
          <p style={{ color: "var(--danger)", margin: 0, fontSize: 14 }}>{matchError}</p>
        </div>
      )}

      {matchResult && (
        <div className="card">
          <div className="card-title">Match Analysis</div>
          <div className="row" style={{ alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 36, fontFamily: "var(--font-display)", color: scoreColor }}>
                {matchResult.score}%
              </div>
              <p style={{ fontSize: 13, color: "var(--paper-dim)", margin: "4px 0 0", maxWidth: 500 }}>
                {matchResult.summary}
              </p>
            </div>
          </div>

          {matchResult.strengths?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="meta" style={{ marginBottom: 6 }}>STRENGTHS</div>
              {matchResult.strengths.map((s, i) => (
                <span key={i} className="pill pill-posted" style={{ marginRight: 6, marginBottom: 6, display: "inline-block" }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {matchResult.missingKeywords?.length > 0 && (
            <div>
              <div className="meta" style={{ marginBottom: 6 }}>MISSING FROM YOUR RESUME</div>
              {matchResult.missingKeywords.map((k, i) => (
                <span key={i} className="pill pill-pending" style={{ marginRight: 6, marginBottom: 6, display: "inline-block" }}>
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {letterError && (
        <div className="card" style={{ borderColor: "var(--danger)" }}>
          <p style={{ color: "var(--danger)", margin: 0, fontSize: 14 }}>{letterError}</p>
        </div>
      )}

      {coverLetter && (
        <div className="card">
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Cover Letter Draft</div>
            <button className="btn btn-ghost" onClick={copyLetter}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{coverLetter}</p>
        </div>
      )}
    </>
  );
}
