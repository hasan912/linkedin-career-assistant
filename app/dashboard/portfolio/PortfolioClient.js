"use client";

import { useEffect, useRef, useState } from "react";

const USERNAME_RE = /^[a-z0-9-]{3,20}$/;

export default function PortfolioClient() {
  const [form, setForm] = useState({
    username: "",
    title: "",
    bio: "",
    skills: [],
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    isPublic: false,
  });
  const [savedUsername, setSavedUsername] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [availability, setAvailability] = useState(null); // null | "checking" | "available" | "taken" | "invalid"
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { kind: "ok" | "error", text }
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const checkTimer = useRef(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/user/portfolio")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.error) return;
        setForm({
          username: data.username || "",
          title: data.title || "",
          bio: data.bio || "",
          skills: data.skills || [],
          portfolioUrl: data.portfolioUrl || "",
          githubUrl: data.githubUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          isPublic: !!data.isPublic,
        });
        setSavedUsername(data.username || "");
      })
      .catch(() => {});
    return () => clearTimeout(checkTimer.current);
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function checkUsername(value) {
    clearTimeout(checkTimer.current);
    const username = value.trim().toLowerCase();
    if (!username || username === savedUsername) {
      setAvailability(null);
      return;
    }
    if (!USERNAME_RE.test(username)) {
      setAvailability("invalid");
      return;
    }
    setAvailability("checking");
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/portfolio?check=${encodeURIComponent(username)}`);
        const data = await res.json();
        setAvailability(data.available ? "available" : "taken");
      } catch {
        setAvailability(null);
      }
    }, 300);
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill) return;
    if (!form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      set("skills", [...form.skills, skill]);
    }
    setSkillInput("");
  }

  function removeSkill(skill) {
    set("skills", form.skills.filter((s) => s !== skill));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim().toLowerCase() || null,
          title: form.title.trim() || null,
          bio: form.bio.trim() || null,
          skills: form.skills,
          portfolioUrl: form.portfolioUrl.trim() || null,
          githubUrl: form.githubUrl.trim() || null,
          linkedinUrl: form.linkedinUrl.trim() || null,
          isPublic: form.isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error || "Something went wrong — try again." });
      } else {
        setSavedUsername(data.username || "");
        setForm((f) => ({ ...f, username: data.username || "", isPublic: data.isPublic }));
        setAvailability(null);
        setMessage({ kind: "ok", text: "Portfolio saved." });
      }
    } catch {
      setMessage({ kind: "error", text: "Network error — try again." });
    }
    setSaving(false);
  }

  const publicUrl = origin && savedUsername ? `${origin}/p/${savedUsername}` : "";
  const publicUrlLabel = savedUsername
    ? `${origin.replace(/^https?:\/\//, "") || "your-app.vercel.app"}/p/${savedUsername}`
    : null;

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const availabilityHint = {
    checking: { className: "text-paper-dim", text: "Checking availability…" },
    available: { className: "text-success", text: "Username is available" },
    taken: { className: "text-danger", text: "That username is already taken" },
    invalid: { className: "text-danger", text: "3-20 characters: lowercase letters, numbers and hyphens" },
  }[availability];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Public URL preview */}
      <section className="card !mb-0" aria-label="Public URL">
        <div className="card-title">Your Public URL</div>
        {publicUrlLabel ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-ink px-3.5 py-2.5 font-mono text-[13px] text-signal-bright">
              {publicUrlLabel}
            </code>
            <button className="btn btn-ghost !py-2 !text-[13px]" onClick={copyUrl}>
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={`/p/${savedUsername}`} target="_blank" rel="noopener noreferrer" className="btn !py-2 !text-[13px] no-underline">
              Open
            </a>
          </div>
        ) : (
          <p className="m-0 text-[13.5px] text-paper-dim">
            Pick a username below and save — your page will live at{" "}
            <code className="rounded bg-ink-raised px-1.5 py-0.5 font-mono text-[12px]">
              {origin.replace(/^https?:\/\//, "") || "your-app.vercel.app"}/p/username
            </code>
          </p>
        )}
        {!form.isPublic && savedUsername && (
          <p className="m-0 mt-3 text-[12.5px] text-warn">
            Your profile is currently private — only you can see it. Flip the toggle below to publish.
          </p>
        )}
      </section>

      {/* Editor */}
      <section className="card !mb-0" aria-label="Portfolio details">
        <div className="card-title">Profile Details</div>

        <div className="field">
          <label htmlFor="pf-username">Username</label>
          <input
            id="pf-username"
            value={form.username}
            placeholder="jane-doe"
            maxLength={20}
            onChange={(e) => {
              set("username", e.target.value);
              setAvailability(null);
            }}
            onBlur={(e) => checkUsername(e.target.value)}
          />
          {availabilityHint && (
            <p className={"m-0 mt-1.5 text-[12px] font-semibold " + availabilityHint.className}>
              {availabilityHint.text}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="pf-title">Title</label>
          <input
            id="pf-title"
            value={form.title}
            placeholder="Frontend Developer"
            maxLength={100}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pf-bio">Bio</label>
          <textarea
            id="pf-bio"
            value={form.bio}
            placeholder="A short introduction — who you are, what you build, what you're looking for."
            maxLength={2000}
            onChange={(e) => set("bio", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pf-skills">Skills</label>
          {form.skills.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 py-1 pl-3 pr-1.5 text-[12.5px] font-semibold text-signal-bright"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="flex h-4.5 w-4.5 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 p-0 text-[11px] leading-none text-paper transition-colors duration-150 hover:bg-danger/60"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            id="pf-skills"
            value={skillInput}
            placeholder="Type a skill and press Enter"
            maxLength={40}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="pf-linkedin">LinkedIn URL</label>
          <input
            id="pf-linkedin"
            type="url"
            value={form.linkedinUrl}
            placeholder="https://www.linkedin.com/in/jane-doe"
            onChange={(e) => set("linkedinUrl", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pf-github">GitHub URL</label>
          <input
            id="pf-github"
            type="url"
            value={form.githubUrl}
            placeholder="https://github.com/jane-doe"
            onChange={(e) => set("githubUrl", e.target.value)}
          />
        </div>

        <div className="field !mb-0">
          <label htmlFor="pf-portfolio">Portfolio / Website URL</label>
          <input
            id="pf-portfolio"
            type="url"
            value={form.portfolioUrl}
            placeholder="https://janedoe.dev"
            onChange={(e) => set("portfolioUrl", e.target.value)}
          />
        </div>
      </section>

      {/* Visibility + save */}
      <section className="card !mb-0" aria-label="Visibility">
        <button
          type="button"
          role="switch"
          aria-checked={form.isPublic}
          onClick={() => set("isPublic", !form.isPublic)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent p-0 text-left"
        >
          <span>
            <span className="block text-[14px] font-semibold text-paper">Public profile</span>
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-paper-dim">
              Anyone with the link can view your portfolio page. Turn off anytime.
            </span>
          </span>
          <span className={"switch " + (form.isPublic ? "switch-on" : "")} aria-hidden="true" />
        </button>

        <div className="mt-5 flex items-center gap-3">
          <button className="btn" onClick={save} disabled={saving}>
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
            )}
            {saving ? "Saving…" : "Save Portfolio"}
          </button>
          {message && (
            <p
              className={
                "m-0 text-[13px] font-semibold " +
                (message.kind === "ok" ? "text-success" : "text-danger")
              }
              role="status"
            >
              {message.text}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
