"use client";

import { useEffect, useState } from "react";

const STATUSES = ["saved", "applied", "interview", "offer", "rejected"];

const STATUS_LABELS = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_ACCENTS = {
  saved: "border-t-paper-dim",
  applied: "border-t-signal",
  interview: "border-t-warn",
  offer: "border-t-success",
  rejected: "border-t-danger",
};

function toDateTimeLocalValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function daysUntil(isoString) {
  if (!isoString) return null;
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function countdownLabel(isoString) {
  const days = daysUntil(isoString);
  if (days === null) return null;
  if (days === 0) return "Interview today";
  if (days === 1) return "Interview tomorrow";
  return `Interview in ${days} days`;
}

export default function ApplicationsClient() {
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const selected = apps.find((a) => a.id === selectedId) || null;

  async function load() {
    const res = await fetch("/api/applications");
    if (res.ok) setApps(await res.json());
    setAppsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Close drawer / modal on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setSelectedId(null);
        setShowAddModal(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openDetails(app) {
    setSelectedId(app.id);
    setNotesDraft(app.notes || "");
  }

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
      setShowAddModal(false);
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

  async function updateInterviewAt(id, localDateTimeValue) {
    // localDateTimeValue is from <input type="datetime-local">, interpreted in
    // the browser's own timezone, then converted to a correct UTC instant.
    const iso = localDateTimeValue ? new Date(localDateTimeValue).toISOString() : null;
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewAt: iso }),
    });
    load();
  }

  async function saveNotes(id) {
    setNotesSaving(true);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setNotesSaving(false);
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setSelectedId(null);
    load();
  }

  function exportCsv() {
    const headers = ["Job Title", "Company", "Status", "Job URL", "Notes", "Applied Date", "Saved On"];
    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = apps.map((a) => [
      a.jobTitle,
      a.company,
      a.status,
      a.jobUrl || "",
      a.notes || "",
      a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : "",
      new Date(a.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, apps.filter((a) => a.status === s)]));

  return (
    <>
      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="card-title !mb-0">Your pipeline</div>
        {apps.length > 0 && (
          <button className="btn btn-ghost !py-2 !text-[13px]" onClick={exportCsv}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M12 3v12M7 10l5 5 5-5M4 19h16" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {appsLoading && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Loading applications">
          {STATUSES.map((s) => (
            <div key={s} className="skeleton h-[220px] w-full" />
          ))}
        </div>
      )}

      {!appsLoading && apps.length === 0 && (
        <div className="empty flex flex-col items-center gap-3 !py-16">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-paper-dim/50" aria-hidden="true">
            <rect x="5" y="4" width="14" height="17" rx="2.5" />
            <path d="M9 10h6M9 14h6M9 18h3.5" />
          </svg>
          <div>
            <p className="m-0 mb-1 text-[15px] font-bold text-paper">Nothing tracked yet</p>
            <p className="m-0 text-[13px]">Save a job lead or add one manually with the + button.</p>
          </div>
        </div>
      )}

      {/* Kanban board */}
      {!appsLoading && apps.length > 0 && (
        <div className="scroll-thin -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-4">
          {STATUSES.map((status) => (
            <section
              key={status}
              aria-label={`${STATUS_LABELS[status]} column`}
              className={
                "flex min-h-[300px] w-[240px] flex-shrink-0 flex-col rounded-2xl border border-glass-border border-t-2 bg-white/[0.025] backdrop-blur-xl " +
                STATUS_ACCENTS[status]
              }
            >
              <header className="flex items-center justify-between px-4 pb-2 pt-3.5">
                <h2 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.08em] text-paper-dim">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[11px] font-extrabold text-paper-dim">
                  {byStatus[status].length}
                </span>
              </header>
              <div className="scroll-thin flex max-h-[540px] flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3">
                {byStatus[status].length === 0 && (
                  <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[12px] text-paper-dim/70">
                    Empty
                  </div>
                )}
                {byStatus[status].map((a) => {
                  const countdown = status === "interview" ? countdownLabel(a.interviewAt) : null;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => openDetails(a)}
                      className="card card-hover !m-0 w-full cursor-pointer border-glass-border !p-3.5 text-left"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0 text-paper-dim/50" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                            <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
                            <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
                            <circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 line-clamp-2 text-[13px] font-bold leading-snug">{a.jobTitle}</div>
                          <div className="truncate text-[12px] text-paper-dim">{a.company}</div>
                          <div className="meta mt-1.5">
                            {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </div>
                          {countdown && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-warn/30 bg-warn/10 px-2 py-1 text-[11px] font-bold text-warn">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 3" />
                              </svg>
                              {countdown}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        aria-label="Add a job lead manually"
        title="Add a job lead"
        className="fixed bottom-7 right-7 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-signal to-accent text-white shadow-[0_8px_24px_rgba(78,140,130,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add a job lead">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 cursor-pointer border-none bg-black/60 backdrop-blur-sm"
          />
          <div className="animate-fade-up card relative !m-0 w-full max-w-md !p-6 shadow-[var(--shadow-pop)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-[17px] font-extrabold tracking-tight">Add a job lead</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-white/5 text-paper-dim transition-colors duration-200 hover:text-paper"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="field">
                <label htmlFor="add-title">Job title</label>
                <input id="add-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="add-company">Company</label>
                <input id="add-company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="add-url">Job link (optional)</label>
                <input id="add-url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://…" />
              </div>
              <button className="btn w-full !py-3" disabled={loading}>
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                )}
                {loading ? "Adding…" : "Add to Tracker"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over details drawer */}
      {selected && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Application details">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 cursor-pointer border-none bg-black/60 backdrop-blur-sm"
          />
          <aside className="scroll-thin absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-border bg-ink-soft p-6 shadow-[var(--shadow-pop)]" style={{ animation: "fade-up 0.3s ease-out both" }}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="avatar h-12 w-12 rounded-xl text-[18px]">
                  {selected.company.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="m-0 text-[17px] font-extrabold leading-tight tracking-tight">{selected.jobTitle}</h2>
                  <div className="text-[13px] text-paper-dim">{selected.company}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close details"
                className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-white/5 text-paper-dim transition-colors duration-200 hover:text-paper"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={`pill pill-${selected.status}`}>{selected.status}</span>
              {selected.jobUrl && (
                <a href={selected.jobUrl} target="_blank" rel="noreferrer" className="meta inline-flex items-center gap-1 no-underline transition-colors duration-200 hover:text-signal-bright">
                  view posting
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
            </div>

            <div className="field">
              <label htmlFor="drawer-status">Status</label>
              <select
                id="drawer-status"
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {selected.status === "interview" && (
              <div className="field">
                <label htmlFor="drawer-interview">Interview date &amp; time</label>
                <input
                  id="drawer-interview"
                  type="datetime-local"
                  value={toDateTimeLocalValue(selected.interviewAt)}
                  onChange={(e) => updateInterviewAt(selected.id, e.target.value)}
                />
                {selected.interviewAt && (
                  <span className="meta mt-1.5 block">
                    {new Date(selected.interviewAt).toLocaleString()}
                    {selected.reminderSent ? " · reminder sent" : " · reminder pending"}
                  </span>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="drawer-notes">Notes</label>
              <textarea
                id="drawer-notes"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Recruiter names, salary range, follow-up dates…"
                className="!min-h-[130px]"
              />
              <button
                type="button"
                className="btn btn-ghost mt-2 !py-2 !text-[13px]"
                onClick={() => saveNotes(selected.id)}
                disabled={notesSaving}
              >
                {notesSaving ? "Saving…" : "Save notes"}
              </button>
            </div>

            <div className="meta mb-6">
              Saved on {new Date(selected.createdAt).toLocaleDateString()}
              {selected.appliedDate && ` · Applied ${new Date(selected.appliedDate).toLocaleDateString()}`}
            </div>

            <div className="border-t border-border pt-5">
              <button className="btn btn-danger w-full" onClick={() => handleDelete(selected.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l1-13M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
                </svg>
                Remove from tracker
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
