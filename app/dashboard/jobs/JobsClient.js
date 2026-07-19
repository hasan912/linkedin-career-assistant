"use client";

import { useEffect, useState } from "react";

const FILTERS = ["Remote", "Full-time", "Part-time", "Contract"];

// Deterministic avatar hue per company name
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4E8C82, #6366F1)",
  "linear-gradient(135deg, #6366F1, #9333EA)",
  "linear-gradient(135deg, #0A66C2, #4E8C82)",
  "linear-gradient(135deg, #F59E0B, #EF4444)",
  "linear-gradient(135deg, #22C55E, #4E8C82)",
  "linear-gradient(135deg, #9333EA, #EF4444)",
];

function gradientFor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export default function JobsClient() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("web developer");
  const [location, setLocation] = useState("Pakistan");
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  async function load(filters = activeFilters) {
    setLoading(true);
    // Filters fold into the search query so the API stays untouched
    const q = [query, ...filters.map((f) => f.toLowerCase())].join(" ").trim();
    const params = new URLSearchParams({ q, location });
    const res = await fetch(`/api/jobs?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleFilter(f) {
    const next = activeFilters.includes(f)
      ? activeFilters.filter((x) => x !== f)
      : [...activeFilters, f];
    setActiveFilters(next);
    load(next);
  }

  async function saveToTracker(job) {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
        jobUrl: job.url,
        status: "saved",
      }),
    });
    if (res.ok) {
      setSavedMsg(`Saved "${job.title}" to your tracker.`);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  }

  return (
    <>
      {/* Search bar */}
      <div className="card">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="field !mb-0 flex-[2]">
            <label htmlFor="job-role">Role</label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-paper-dim"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                id="job-role"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. web developer"
                className="!py-3.5 !pl-11 !text-[15px]"
              />
            </div>
          </div>
          <div className="field !mb-0 flex-1">
            <label htmlFor="job-location">Location (optional)</label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-paper-dim"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                id="job-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote"
                className="!py-3.5 !pl-11 !text-[15px]"
              />
            </div>
          </div>
          <button type="submit" className="btn !py-3.5 sm:w-auto" disabled={loading}>
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
            )}
            Search
          </button>
        </form>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Job type filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={activeFilters.includes(f)}
              onClick={() => toggleFilter(f)}
              className={"chip " + (activeFilters.includes(f) ? "chip-active" : "")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {savedMsg && (
        <div className="notice animate-fade-up flex items-center gap-2" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 text-signal-bright" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {savedMsg}
        </div>
      )}

      {/* Results grid */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Loading job leads">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[132px] w-full" />
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="empty flex flex-col items-center gap-3 !py-16">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-paper-dim/50" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3M8 11h6" />
          </svg>
          <div>
            <p className="m-0 mb-1 text-[15px] font-bold text-paper">No results found</p>
            <p className="m-0 text-[13px]">Try a broader role, a different location, or fewer filters.</p>
          </div>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {jobs.map((job, i) => (
            <article key={i} className="card card-hover !mb-0 flex flex-col">
              <div className="flex items-start gap-3.5">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[16px] font-extrabold text-white shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                  style={{ background: gradientFor(job.company) }}
                  aria-hidden="true"
                >
                  {(job.company || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="job-title m-0 line-clamp-2 !text-[15px]">{job.title}</h2>
                  <div className="job-company truncate">{job.company}</div>
                  <div className="mt-1 flex items-center gap-1 text-[12px] text-paper-dim">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{job.location || "Not specified"}</span>
                  </div>
                </div>
                <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-bright">
                  {job.source}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <a className="btn flex-1 !py-2.5 !text-[13px] no-underline" href={job.url} target="_blank" rel="noreferrer">
                  View &amp; Apply
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
                <button
                  className="btn-ghost btn flex-shrink-0 !px-3.5 !py-2.5"
                  onClick={() => saveToTracker(job)}
                  aria-label={`Save ${job.title} to tracker`}
                  title="Save to tracker"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]" aria-hidden="true">
                    <path d="M19 21 12 16.5 5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21Z" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
