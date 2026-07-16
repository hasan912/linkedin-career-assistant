"use client";

import { useEffect, useState } from "react";

const STATUSES = ["saved", "applied", "interview", "offer", "rejected"];

export default function ApplicationsClient() {
  const [apps, setApps] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/applications");
    if (res.ok) setApps(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!jobTitle.trim() || !company.trim()) return;
    setLoading(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, company, jobUrl }),
    });
    setLoading(false);
    if (res.ok) {
      setJobTitle("");
      setCompany("");
      setJobUrl("");
      load();
    }
  }

  async function updateStatus(id, status) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Add a lead manually</div>
        <form onSubmit={handleAdd}>
          <div className="row" style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Job title</label>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Job link (optional)</label>
              <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
            </div>
          </div>
          <button className="btn" disabled={loading}>
            {loading ? "Adding…" : "Add to Tracker"}
          </button>
        </form>
      </div>

      <div className="card-title" style={{ marginTop: 32 }}>Your pipeline</div>
      {apps.length === 0 && <div className="empty">Nothing tracked yet — save a job lead or add one manually.</div>}
      {apps.map((a) => (
        <div className="card" key={a.id}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="job-title">{a.jobTitle}</div>
              <div className="job-company">{a.company}</div>
              {a.jobUrl && (
                <a href={a.jobUrl} target="_blank" rel="noreferrer" className="meta">
                  view posting →
                </a>
              )}
            </div>
            <span className={`pill pill-${a.status}`}>{a.status}</span>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
