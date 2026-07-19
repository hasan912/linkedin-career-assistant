"use client";

import { useEffect, useState } from "react";

const INSTALL_STEPS = [
  <>Download the <code>browser-extension/</code> folder from the project ZIP.</>,
  <>Open Chrome → <code>chrome://extensions</code> → enable &ldquo;Developer mode&rdquo; (top right).</>,
  <>Click &ldquo;Load unpacked&rdquo; → select the <code>browser-extension</code> folder.</>,
  <>Click the extension icon → &ldquo;Options&rdquo; → paste your API token and this site&rsquo;s URL.</>,
  <>On any job posting page, click the icon → &ldquo;Save to Career Console&rdquo;.</>,
];

export default function SettingsClient() {
  const [hasToken, setHasToken] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prefs, setPrefs] = useState({ digestEmail: true });

  useEffect(() => {
    fetch("/api/settings/api-token")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setHasToken(!!d.hasToken); })
      .catch(() => {});
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (p && !p.error) setPrefs(p); })
      .catch(() => {});
  }, []);

  async function generateToken() {
    setTokenLoading(true);
    const res = await fetch("/api/settings/api-token", { method: "POST" });
    setTokenLoading(false);
    if (res.ok) { const d = await res.json(); setNewToken(d.token); setHasToken(true); }
  }

  function copyToken() {
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleDigest() {
    const next = !prefs.digestEmail;
    setPrefs((p) => ({ ...p, digestEmail: next }));
    await fetch("/api/user/preferences", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digestEmail: next }),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile */}
      <section className="card !mb-0" aria-label="Profile">
        <div className="card-title">Profile</div>
        <div className="flex items-center gap-4">
          <span className="avatar h-14 w-14 rounded-2xl text-[20px]">
            {(prefs.name || "U").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[16px] font-extrabold tracking-tight">{prefs.name || "—"}</div>
            <div className="truncate text-[13px] text-paper-dim">{prefs.email || "No email on file"}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#0a66c2]/40 bg-[#0a66c2]/10 px-2.5 py-1 text-[11px] font-bold text-[#6fa8dc]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
              </svg>
              Connected via LinkedIn
            </div>
          </div>
        </div>
        <p className="m-0 mt-3 text-[12px] text-paper-dim">
          Name and email come from your LinkedIn account and can&rsquo;t be edited here.
        </p>
      </section>

      {/* Email preferences */}
      <section className="card !mb-0" aria-label="Email preferences">
        <div className="card-title">Email Preferences</div>
        <button
          type="button"
          role="switch"
          aria-checked={!!prefs.digestEmail}
          onClick={toggleDigest}
          className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent p-0 text-left"
        >
          <span>
            <span className="block text-[14px] font-semibold text-paper">Weekly email digest</span>
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-paper-dim">
              Posts published, applications sent, and upcoming interviews — every week in your inbox.
            </span>
          </span>
          <span className={"switch " + (prefs.digestEmail ? "switch-on" : "")} aria-hidden="true" />
        </button>
      </section>

      {/* Browser extension */}
      <section className="card !mb-0" aria-label="Browser extension">
        <div className="card-title">Browser Extension API Token</div>
        <p className="m-0 mb-4 text-[13.5px] leading-relaxed text-paper-dim">
          This token lets the Career Console browser extension save jobs to your tracker with one click.
          It only grants access to adding job leads — nothing else.
        </p>

        {hasToken && !newToken && (
          <p className="mb-4 mt-0 flex items-center gap-2 text-[13px] text-paper-dim">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 text-success" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            A token has already been generated. Generating a new one will invalidate it.
          </p>
        )}

        {newToken && (
          <div className="grad-border animate-fade-up mb-4">
            <div className="grad-border-inner p-4">
              <p className="m-0 mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                  <path d="M12 9v4M12 17v.5M10.3 3.9 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                Copy this now — it won&rsquo;t be shown again.
              </p>
              <code className="mb-3 block break-all rounded-lg bg-ink px-3.5 py-3 font-mono text-[13px] text-signal-bright">
                {newToken}
              </code>
              <button className="btn btn-ghost !py-2 !text-[13px]" onClick={copyToken}>
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
                {copied ? "Copied" : "Copy Token"}
              </button>
            </div>
          </div>
        )}

        <button className="btn" onClick={generateToken} disabled={tokenLoading}>
          {tokenLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          )}
          {tokenLoading ? "Generating…" : hasToken ? "Generate New Token" : "Generate Token"}
        </button>

        {/* Install steps as numbered cards */}
        <div className="card-title mt-8">Set Up the Extension</div>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {INSTALL_STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-3.5 rounded-xl border border-glass-border bg-white/[0.025] px-4 py-3.5 transition-colors duration-200 hover:border-signal/40">
              <span className="avatar mt-0.5 h-7 w-7 flex-shrink-0 rounded-lg text-[12px]">{i + 1}</span>
              <span className="text-[13.5px] leading-relaxed text-paper-dim [&_code]:rounded [&_code]:bg-ink-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-signal-bright">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-danger/35 bg-danger/[0.04] p-6" aria-label="Danger zone">
        <div className="card-title !text-danger">Danger Zone</div>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-[14px] font-semibold">Delete account</div>
            <p className="m-0 mt-0.5 text-[12.5px] text-paper-dim">
              Permanently remove your account and all data. Coming soon — for now, use data export
              in Analytics, then contact support.
            </p>
          </div>
          <button className="btn btn-danger flex-shrink-0" disabled title="Coming soon">
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
