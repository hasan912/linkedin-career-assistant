"use client";

import { useEffect, useState } from "react";

export default function JobsClient() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("web developer");
  const [location, setLocation] = useState("Pakistan");
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ q: query, location });
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
      <div className="card">
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, marginBottom: 0 }}>
            <label>Role</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Location (optional)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote" />
          </div>
          <button className="btn" style={{ marginTop: 20 }} onClick={load}>
            Search
          </button>
        </div>
      </div>

      {savedMsg && <div className="notice">{savedMsg}</div>}

      <div className="card">
        {loading && <div className="empty">Loading leads…</div>}
        {!loading && jobs.length === 0 && <div className="empty">No results — try a different search.</div>}
        {!loading &&
          jobs.map((job, i) => (
            <div className="job-item" key={i}>
              <div className="row">
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">
                    {job.company} · {job.location} · <span className="meta">{job.source}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => saveToTracker(job)}>
                    Save
                  </button>
                  <a className="btn" href={job.url} target="_blank" rel="noreferrer">
                    View & Apply
                  </a>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
