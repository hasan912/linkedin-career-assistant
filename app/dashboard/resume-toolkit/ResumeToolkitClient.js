"use client";

import { useEffect, useState } from "react";

/* Animated circular gauge, colored red→yellow→green by score */
function ScoreGauge({ score }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(score / 100));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} role="img" aria-label={`Match score ${score} out of 100`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ink-raised)" strokeWidth={stroke} />
        <circle
          cx={c} cy={c} r={r} fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - animated)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[38px] font-black leading-none tracking-tight" style={{ color }}>{score}</span>
        <span className="mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-paper-dim">/ 100</span>
      </div>
    </div>
  );
}

/* Horizontal min–mid–max salary bar (no chart library needed) */
function SalaryBar({ currency, range }) {
  const max = Math.max(Number(range?.max) || 0, 1);
  const min = Math.max(Number(range?.min) || 0, 0);
  const mid = Math.max(Number(range?.mid) || 0, 0);
  const leftPct = Math.min((min / max) * 100, 100);
  const widthPct = Math.max(Math.min(((max - min) / max) * 100, 100), 2);
  const midPct = Math.min((mid / max) * 100, 100);
  const fmt = (n) =>
    currency === "PKR" ? `Rs ${Number(n).toLocaleString()}` : `$${Number(n).toLocaleString()}`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-paper-dim">{currency}</span>
        <span className="text-[13px] font-bold text-paper">
          {fmt(mid)} <span className="font-normal text-paper-dim">median / yr</span>
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-ink-raised">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-signal to-accent"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <div
          className="absolute inset-y-[-3px] w-[3px] rounded-full bg-paper shadow-[0_0_0_2px_var(--ink-soft)]"
          style={{ left: `calc(${midPct}% - 1.5px)` }}
          title={`Median ${fmt(mid)}`}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11.5px] font-semibold text-paper-dim">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

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

  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salaryJobTitle, setSalaryJobTitle] = useState("");
  const [salaryLocation, setSalaryLocation] = useState("Karachi, Pakistan");
  const [salaryYears, setSalaryYears] = useState(2);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [salaryResult, setSalaryResult] = useState(null);

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

  async function handleSalary() {
    setSalaryError("");
    setSalaryResult(null);
    if (!salaryJobTitle.trim() || !salaryLocation.trim()) {
      setSalaryError("Enter a job title and location first.");
      return;
    }
    setSalaryLoading(true);
    const res = await fetch("/api/ai/salary-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: salaryJobTitle,
        location: salaryLocation,
        experienceYears: Number(salaryYears) || 0,
      }),
    });
    setSalaryLoading(false);
    if (res.ok) {
      setSalaryResult(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setSalaryError(data.error || "Couldn't get an estimate. Try again.");
    }
  }

  return (
    <>
      {/* Two-panel input layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card !mb-0">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="avatar flex h-8 w-8 rounded-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M6 2.5h8L19 7.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-16A1.5 1.5 0 0 1 6.5 2.5Z" />
                <path d="M14 2.5V8h5M9 12.5h6M9 16.5h6" />
              </svg>
            </span>
            <label htmlFor="resume-input" className="card-title !mb-0">Your Resume</label>
          </div>
          <textarea
            id="resume-input"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here…"
            className="min-h-[300px] w-full resize-y rounded-xl border border-border bg-ink-raised p-4 text-[14px] leading-relaxed text-paper transition-[border-color,box-shadow] duration-200 placeholder:text-paper-dim/60 focus:border-signal focus:shadow-[0_0_0_3px_rgba(78,140,130,0.18)] focus:outline-none"
          />
          <div className="meta mt-2 text-right" aria-live="polite">{resume.length.toLocaleString()} characters</div>
        </div>

        <div className="card !mb-0">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="avatar flex h-8 w-8 rounded-lg !bg-gradient-to-br !from-accent !to-signal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2.5" />
                <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
                <path d="M3 12.5h18" />
              </svg>
            </span>
            <label htmlFor="jd-input" className="card-title !mb-0">Job Description</label>
          </div>
          <textarea
            id="jd-input"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job posting text here…"
            className="min-h-[300px] w-full resize-y rounded-xl border border-border bg-ink-raised p-4 text-[14px] leading-relaxed text-paper transition-[border-color,box-shadow] duration-200 placeholder:text-paper-dim/60 focus:border-signal focus:shadow-[0_0_0_3px_rgba(78,140,130,0.18)] focus:outline-none"
          />
          <div className="meta mt-2 text-right" aria-live="polite">{jobDescription.length.toLocaleString()} characters</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="my-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button className="btn !px-8 !py-3.5 text-[15px]" onClick={handleAnalyze} disabled={matchLoading}>
          {matchLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M9 11l1.5 1.5L14 9" />
            </svg>
          )}
          {matchLoading ? "Analyzing…" : "Analyze Match"}
        </button>
        <button className="btn btn-ghost !px-8 !py-3.5 text-[15px]" onClick={handleGenerateLetter} disabled={letterLoading}>
          {letterLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper-dim/40 border-t-paper" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
            </svg>
          )}
          {letterLoading ? "Writing…" : "Generate Cover Letter"}
        </button>
      </div>

      {matchError && (
        <div className="card !border-danger/40" role="alert">
          <p className="m-0 flex items-center gap-2 text-[14px] text-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" />
            </svg>
            {matchError}
          </p>
        </div>
      )}

      {/* Match result */}
      {matchResult && (
        <section className="card card-hover animate-fade-up" aria-label="Match analysis">
          <div className="card-title">Match Analysis</div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <ScoreGauge score={matchResult.score} />
            <div className="min-w-0 flex-1">
              <p className="m-0 mb-5 text-[14px] leading-relaxed text-paper-dim">{matchResult.summary}</p>

              {matchResult.strengths?.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-success">Strengths</div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.strengths.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12.5px] font-semibold text-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.missingKeywords?.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-warn">Missing from your resume</div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingKeywords.map((k, i) => (
                      <span
                        key={i}
                        title="Add this to your resume"
                        className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-3 py-1.5 text-[12.5px] font-semibold text-warn"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {letterError && (
        <div className="card !border-danger/40" role="alert">
          <p className="m-0 flex items-center gap-2 text-[14px] text-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" />
            </svg>
            {letterError}
          </p>
        </div>
      )}

      {/* Cover letter output */}
      {coverLetter && (
        <section className="grad-border animate-fade-up mb-4" aria-label="Cover letter draft">
          <div className="grad-border-inner p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="card-title !mb-0">Cover Letter Draft</div>
              <button className="btn btn-ghost !px-4 !py-2 !text-[12.5px]" onClick={copyLetter}>
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-success" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <label htmlFor="letter-output" className="sr-only">Cover letter text — editable</label>
            <textarea
              id="letter-output"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[320px] w-full resize-y rounded-xl border border-border bg-ink-raised p-4 text-[14px] leading-[1.75] text-paper transition-[border-color,box-shadow] duration-200 focus:border-signal focus:shadow-[0_0_0_3px_rgba(78,140,130,0.18)] focus:outline-none"
            />
          </div>
        </section>
      )}

      {/* Salary Insights — collapsible */}
      <section className="card !mb-0" aria-label="Salary insights">
        <button
          type="button"
          onClick={() => setSalaryOpen((o) => !o)}
          aria-expanded={salaryOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left"
        >
          <span className="card-title !mb-0 flex items-center gap-2.5">
            <span aria-hidden="true">💰</span> Salary Insights
          </span>
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={"h-5 w-5 flex-shrink-0 text-paper-dim transition-transform duration-200 " + (salaryOpen ? "rotate-180" : "")}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {salaryOpen && (
          <div className="mt-5 animate-fade-up">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="field !mb-0">
                <label htmlFor="salary-title">Job title</label>
                <input
                  id="salary-title"
                  value={salaryJobTitle}
                  onChange={(e) => setSalaryJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="field !mb-0">
                <label htmlFor="salary-location">Location</label>
                <input
                  id="salary-location"
                  value={salaryLocation}
                  onChange={(e) => setSalaryLocation(e.target.value)}
                />
              </div>
              <div className="field !mb-0">
                <label htmlFor="salary-years">Years of experience</label>
                <input
                  id="salary-years"
                  type="number"
                  min={0}
                  max={20}
                  value={salaryYears}
                  onChange={(e) => setSalaryYears(e.target.value)}
                />
              </div>
            </div>

            <button className="btn mt-5 !px-7 !py-3" onClick={handleSalary} disabled={salaryLoading}>
              {salaryLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              )}
              {salaryLoading ? "Estimating…" : "Get Estimate"}
            </button>

            {salaryError && (
              <p className="mt-4 flex items-center gap-2 text-[14px] text-danger" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" />
                </svg>
                {salaryError}
              </p>
            )}

            {salaryResult && (
              <div className="mt-6 flex flex-col gap-6 animate-fade-up">
                {/* Salary range bars */}
                <div className="flex flex-col gap-5 rounded-2xl border border-glass-border bg-white/[0.025] p-5">
                  {salaryResult.rangePKR && <SalaryBar currency="PKR" range={salaryResult.rangePKR} />}
                  {salaryResult.rangeUSD && <SalaryBar currency="USD" range={salaryResult.rangeUSD} />}
                </div>

                {/* Market context */}
                {salaryResult.context && (
                  <div>
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-signal-bright">Market context</div>
                    <p className="m-0 text-[14px] leading-relaxed text-paper-dim">{salaryResult.context}</p>
                  </div>
                )}

                {/* Negotiation tips */}
                {salaryResult.tips?.length > 0 && (
                  <div>
                    <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-success">Negotiation talking points</div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {salaryResult.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3.5 rounded-xl border border-glass-border bg-white/[0.025] px-4 py-3.5">
                          <span className="avatar mt-0.5 h-7 w-7 flex-shrink-0 rounded-lg text-[12px]">{i + 1}</span>
                          <span className="text-[13.5px] leading-relaxed text-paper">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {salaryResult.disclaimer && (
                  <p className="m-0 text-[11.5px] leading-relaxed text-paper-dim/70">{salaryResult.disclaimer}</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
