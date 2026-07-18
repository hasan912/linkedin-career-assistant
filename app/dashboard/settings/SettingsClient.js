"use client";

import { useEffect, useState } from "react";

export default function SettingsClient() {
  const [hasToken, setHasToken] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings/api-token")
      .then((res) => res.json())
      .then((data) => setHasToken(data.hasToken))
      .catch(() => {});
  }, []);

  async function generateToken() {
    setLoading(true);
    const res = await fetch("/api/settings/api-token", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setNewToken(data.token);
      setHasToken(true);
    }
  }

  function copyToken() {
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card">
      <div className="card-title">Browser Extension API Token</div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--paper-dim)" }}>
        This token lets the Career Console browser extension save jobs to your tracker
        with one click. It's separate from your LinkedIn login and only grants access
        to adding job leads — nothing else.
      </p>

      {hasToken && !newToken && (
        <p className="meta" style={{ marginBottom: 16 }}>
          ✓ A token has already been generated. Generating a new one will invalidate it.
        </p>
      )}

      {newToken && (
        <div
          style={{
            background: "var(--ink)",
            border: "1px solid var(--signal)",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--warn)", margin: "0 0 8px" }}>
            Copy this now — it won't be shown again.
          </p>
          <code style={{ fontSize: 13, wordBreak: "break-all", display: "block", marginBottom: 10 }}>
            {newToken}
          </code>
          <button className="btn btn-ghost" onClick={copyToken}>
            {copied ? "Copied ✓" : "Copy Token"}
          </button>
        </div>
      )}

      <button className="btn" onClick={generateToken} disabled={loading}>
        {loading ? "Generating…" : hasToken ? "Generate New Token" : "Generate Token"}
      </button>

      <div className="card-title" style={{ marginTop: 28 }}>Set Up the Extension</div>
      <ol style={{ fontSize: 14, lineHeight: 1.9, color: "var(--paper-dim)", paddingLeft: 20 }}>
        <li>Download the extension folder from the project's <code>browser-extension/</code> directory.</li>
        <li>Open Chrome → go to <code>chrome://extensions</code> → enable "Developer mode" (top right).</li>
        <li>Click "Load unpacked" and select the <code>browser-extension</code> folder.</li>
        <li>Click the extension's icon → "Options" → paste your API token and this site's URL.</li>
        <li>On any job posting page, click the extension icon → "Save to Career Console".</li>
      </ol>
    </div>
  );
}
