"use client";

import { useEffect, useRef, useState } from "react";
import { zonedTimeToUtc, COMMON_TIMEZONES, detectBrowserTimezone } from "@/lib/timezone";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

let nextImageId = 1;
const MAX_IMAGES = 9; // LinkedIn's carousel limit

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59

const TONES = ["Professional", "Casual", "Storytelling", "Technical"];

const REPEAT_OPTIONS = [
  {
    value: "none",
    label: "None",
    hint: "Publish once",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
      </svg>
    ),
  },
  {
    value: "daily",
    label: "Daily",
    hint: "Same time each day",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: "weekly",
    label: "Weekly",
    hint: "Same day & time",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M8 3v4M16 3v4M3 10h18M12 14.5l1.2 2.4 2.6.4-1.9 1.9.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.9 2.6-.4L12 14.5Z" />
      </svg>
    ),
  },
];

export default function PostsClient() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [dateStr, setDateStr] = useState(todayStr());
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");
  const [timeZone, setTimeZone] = useState(detectBrowserTimezone());
  const [repeat, setRepeat] = useState("none");

  // images: [{ id, previewUrl, urn, uploading, error }]
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // AI post generator state
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);
  const [userName, setUserName] = useState("You");

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.name) setUserName(d.name); })
      .catch(() => {});
  }, []);

  async function load() {
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
    setPostsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerateWithAi() {
    setAiError("");
    if (!aiTopic.trim()) {
      setAiError("Enter a topic first.");
      return;
    }
    setAiLoading(true);
    const res = await fetch("/api/ai/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: aiTopic, tone: aiTone }),
    });
    setAiLoading(false);
    if (res.ok) {
      const data = await res.json();
      setContent(data.post);
    } else {
      const data = await res.json().catch(() => ({}));
      setAiError(data.error || "Couldn't generate a post. Try again.");
    }
  }

  async function handleImagesSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const room = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, room);

    for (const file of toAdd) {
      const id = nextImageId++;
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id, previewUrl, urn: null, uploading: true, error: null }]);

      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/posts/upload-image", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, urn: data.imageUrn, uploading: false } : img)));
        } else {
          const data = await res.json().catch(() => ({}));
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, uploading: false, error: data.error || "Upload failed" } : img)));
        }
      } catch {
        setImages((prev) => prev.map((img) => (img.id === id ? { ...img, uploading: false, error: "Network error" } : img)));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  const anyUploading = images.some((img) => img.uploading);
  const readyImageUrns = images.filter((img) => img.urn).map((img) => img.urn);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Write something first.");
      return;
    }
    if (anyUploading) {
      setError("Images are still uploading — wait a moment.");
      return;
    }

    let hour24 = hour12 % 12;
    if (ampm === "PM") hour24 += 12;
    const scheduledForUtc = zonedTimeToUtc(dateStr, hour24, minute, timeZone).toISOString();

    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        scheduledFor: scheduledForUtc,
        imageUrns: readyImageUrns,
        repeat,
        timeZone,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      setImages([]);
      setRepeat("none");
      load();
    } else {
      setError("Couldn't schedule that post. Try again.");
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  function confirmDelete(p) {
    const msg =
      p.status === "pending"
        ? "Cancel this scheduled post? It won't be published."
        : "Remove this post from your list? (This doesn't delete anything from LinkedIn.)";
    if (window.confirm(msg)) handleDelete(p.id);
  }

  return (
    <>
      {/* Split layout: form (left) + live LinkedIn preview (right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_3fr]">
        {/* ------------------------------------------------ form panel */}
        <div className="card !mb-0">
          <div className="card-title">Schedule a new post</div>
          <form onSubmit={handleSubmit}>
            {/* AI generator — collapsible, gradient border */}
            <div className="grad-border mb-5">
              <div className="grad-border-inner p-4">
                <button
                  type="button"
                  onClick={() => setShowAiPanel((s) => !s)}
                  aria-expanded={showAiPanel}
                  className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-0 text-left text-paper"
                >
                  <span className="flex items-center gap-2.5 text-[13.5px] font-bold">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] text-signal-bright" aria-hidden="true">
                      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
                      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
                    </svg>
                    Generate with AI
                  </span>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={"h-4 w-4 text-paper-dim transition-transform duration-300 " + (showAiPanel ? "rotate-180" : "")}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {showAiPanel && (
                  <div className="animate-fade-up mt-4">
                    <div className="field">
                      <label htmlFor="ai-topic">Topic</label>
                      <input
                        id="ai-topic"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. why I switched from Python to Next.js"
                      />
                    </div>
                    <div className="field !mb-3">
                      <label id="tone-label">Tone</label>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="tone-label">
                        {TONES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={aiTone === t}
                            onClick={() => setAiTone(t)}
                            className={"chip " + (aiTone === t ? "chip-active" : "")}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="btn w-full" onClick={handleGenerateWithAi} disabled={aiLoading}>
                      {aiLoading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                      )}
                      {aiLoading ? "Writing…" : "Generate"}
                    </button>
                    {aiError && (
                      <p className="m-0 mt-2.5 text-[13px] text-danger" role="alert">{aiError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="post-content">Post content</label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to share on LinkedIn?"
                className="!min-h-[150px]"
              />
            </div>

            {/* Image upload zone */}
            <div className="field">
              <label>
                Photos (optional — 1 photo, or 2-{MAX_IMAGES} for a carousel post)
              </label>
              {images.length < MAX_IMAGES && (
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-white/[0.02] px-4 py-7 text-center transition-colors duration-200 hover:border-signal hover:bg-signal/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-paper-dim transition-colors duration-200 group-hover:text-signal-bright" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-4.5-4.5L7 20" />
                  </svg>
                  <span className="text-[13px] font-semibold text-paper-dim transition-colors duration-200 group-hover:text-paper">
                    Click to add images
                  </span>
                  <span className="text-[11px] text-paper-dim/70">JPEG, PNG or GIF</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    multiple
                    onChange={handleImagesSelect}
                    className="sr-only"
                  />
                </label>
              )}
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {images.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.previewUrl}
                        alt="Selected attachment preview"
                        className={"block h-[84px] w-[84px] rounded-xl object-cover shadow-[0_4px_10px_rgba(0,0,0,0.35)] " + (img.uploading ? "opacity-50" : "")}
                      />
                      {img.uploading && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-label="Uploading" />
                        </span>
                      )}
                      {img.error && (
                        <span className="block max-w-[84px] text-[9px] text-danger" role="alert">{img.error}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-none bg-danger text-[12px] leading-none text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-150 hover:scale-110"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="post-date">Publish date</label>
              <input id="post-date" type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
            </div>

            {/* Time picker: hour / minute selects + AM-PM segments */}
            <div className="field">
              <label id="time-label">Publish time</label>
              <div className="flex items-stretch gap-2" role="group" aria-labelledby="time-label">
                <select
                  aria-label="Hour"
                  value={hour12}
                  onChange={(e) => setHour12(Number(e.target.value))}
                  className="w-full flex-1 cursor-pointer rounded-[10px] border border-border bg-ink-raised px-3 py-2.5 text-center text-[17px] font-bold text-paper transition-colors duration-200 focus:border-signal focus:outline-none"
                >
                  {HOURS_12.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="flex items-center text-[18px] font-extrabold text-paper-dim" aria-hidden="true">:</span>
                <select
                  aria-label="Minute"
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  className="w-full flex-1 cursor-pointer rounded-[10px] border border-border bg-ink-raised px-3 py-2.5 text-center text-[17px] font-bold text-paper transition-colors duration-200 focus:border-signal focus:outline-none"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <div className="flex overflow-hidden rounded-[10px] border border-border-strong" role="radiogroup" aria-label="AM or PM">
                  {["AM", "PM"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={ampm === v}
                      onClick={() => setAmpm(v)}
                      className={
                        "cursor-pointer border-none px-4 text-[13px] font-bold transition-colors duration-200 " +
                        (ampm === v
                          ? "bg-gradient-to-br from-signal to-accent text-white"
                          : "bg-ink-raised text-paper-dim hover:text-paper")
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="post-tz">Timezone</label>
              <select id="post-tz" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="cursor-pointer">
                {!COMMON_TIMEZONES.includes(timeZone) && (
                  <option value={timeZone}>{timeZone} (detected)</option>
                )}
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Repeat: icon cards */}
            <div className="field">
              <label id="repeat-label">Repeat</label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="repeat-label">
                {REPEAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={repeat === opt.value}
                    onClick={() => setRepeat(opt.value)}
                    className={
                      "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 transition-all duration-200 " +
                      (repeat === opt.value
                        ? "border-transparent bg-gradient-to-br from-signal/25 to-accent/25 shadow-[inset_0_0_0_1px_rgba(111,179,168,0.5),0_4px_14px_rgba(78,140,130,0.2)]"
                        : "border-border-strong bg-white/[0.02] hover:border-signal/50")
                    }
                  >
                    <span className={"h-5 w-5 " + (repeat === opt.value ? "text-signal-bright" : "text-paper-dim")}>
                      {opt.icon}
                    </span>
                    <span className={"text-[12.5px] font-bold " + (repeat === opt.value ? "text-paper" : "text-paper-dim")}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] leading-tight text-paper-dim">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mb-3 mt-0 text-[13px] text-danger" role="alert">{error}</p>
            )}
            <button type="submit" className="btn w-full !py-3.5 text-[15px]" disabled={loading || anyUploading}>
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              )}
              {loading ? "Scheduling…" : "Schedule Post"}
            </button>
          </form>
        </div>

        {/* -------------------------------------- live LinkedIn preview */}
        <div className="lg:sticky lg:top-8">
          <div className="card-title">Live Preview</div>
          <div className="rounded-2xl bg-[#f3f2ef] p-4 text-black shadow-[var(--shadow-pop)]">
            <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
              <div className="mb-2.5 flex gap-2.5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#0a66c2] text-[19px] font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-bold leading-snug text-[rgba(0,0,0,0.9)]">{userName}</div>
                  <div className="text-[12px] leading-snug text-[rgba(0,0,0,0.6)]">Frontend Developer</div>
                  <div className="flex items-center gap-1 text-[12px] text-[rgba(0,0,0,0.6)]">
                    Just now ·
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                      <path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7Zm4.4 7.5h-2.2a11.4 11.4 0 0 1-.6 3.4 5.6 5.6 0 0 0 2.8-3.4ZM8 12.9a9.5 9.5 0 0 1-1-4.4h2a9.5 9.5 0 0 1-1 4.4ZM3.6 8.5a5.6 5.6 0 0 0 2.8 3.4 11.4 11.4 0 0 1-.6-3.4Zm0-1h2.2a11.4 11.4 0 0 1 .6-3.4A5.6 5.6 0 0 0 3.6 7.5ZM8 3.1a9.5 9.5 0 0 1 1 4.4H7a9.5 9.5 0 0 1 1-4.4Zm2.4 4.4a11.4 11.4 0 0 1-.6-3.4 5.6 5.6 0 0 1 2.8 3.4Z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mb-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[rgba(0,0,0,0.9)]">
                {content || <span className="text-[rgba(0,0,0,0.4)]">Start typing to see your post preview…</span>}
              </div>
              {images.length > 0 && (
                <div className={"mb-1 gap-1 overflow-hidden rounded-lg " + (images.length === 1 ? "" : "grid grid-cols-3")}>
                  {images.map((img) => (
                    <img
                      key={img.id}
                      src={img.previewUrl}
                      alt=""
                      className={images.length === 1 ? "h-auto w-full" : "aspect-square w-full object-cover"}
                    />
                  ))}
                </div>
              )}
              <div className="mt-1 flex items-center justify-around border-t border-[rgba(0,0,0,0.08)] pt-1">
                {[
                  {
                    label: "Like",
                    icon: <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Zm3.6-6.6L10 8h8.5a2 2 0 0 1 2 2.4l-1.4 7a2 2 0 0 1-2 1.6H9V9.5l2.2-5.7a1.4 1.4 0 0 1 2.6.6 8 8 0 0 1-.3 2.1" />,
                  },
                  { label: "Comment", icon: <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.9 8.9 0 0 1-3.2-.6L3.5 21l1.7-4.3a8.3 8.3 0 0 1-1.2-4.4A8.4 8.4 0 0 1 12.5 4a8.4 8.4 0 0 1 8.5 7.5Z" /> },
                  { label: "Repost", icon: <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /> },
                  { label: "Send", icon: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /> },
                ].map((b) => (
                  <span key={b.label} className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-[13px] font-semibold text-[rgba(0,0,0,0.6)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      {b.icon}
                    </svg>
                    <span className="hidden sm:inline">{b.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- posts list */}
      <div className="card-title mt-10">Your posts</div>
      {postsLoading && (
        <div className="flex flex-col gap-3" aria-label="Loading posts">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-[92px] w-full" />
          ))}
        </div>
      )}
      {!postsLoading && posts.length === 0 && (
        <div className="empty">No posts scheduled yet — your queue is clear.</div>
      )}
      {!postsLoading && posts.map((p) => (
        <article className="card card-hover" key={p.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 mb-2 line-clamp-3 text-[14px] leading-relaxed">{p.content}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {p.imageUrns?.length === 1 && (
                  <span className="meta inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-4.5-4.5L7 20" />
                    </svg>
                    Photo attached
                  </span>
                )}
                {p.imageUrns?.length > 1 && (
                  <span className="meta inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-4.5-4.5L7 20" />
                    </svg>
                    {p.imageUrns.length}-photo carousel
                  </span>
                )}
                {p.repeat !== "none" && (
                  <span className="meta inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
                    </svg>
                    Repeats {p.repeat}
                  </span>
                )}
                <span className="meta">
                  {p.status === "posted" && p.postedAt
                    ? `Published ${new Date(p.postedAt).toLocaleString()}`
                    : `Scheduled for ${new Date(p.scheduledFor).toLocaleString()}`}
                </span>
              </div>
              {p.status === "failed" && p.errorMessage && (
                <p className="mb-0 mt-2 text-[12px] text-danger" role="alert">{p.errorMessage}</p>
              )}
            </div>
            <span className={`pill pill-${p.status} flex-shrink-0`}>{p.status}</span>
          </div>
          {p.status === "pending" && (
            <button className="btn btn-danger mt-3 !py-2 !text-[13px]" onClick={() => confirmDelete(p)}>
              Cancel
            </button>
          )}
          {(p.status === "failed" || p.status === "posted") && (
            <button className="btn btn-danger mt-3 !py-2 !text-[13px]" onClick={() => confirmDelete(p)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l1-13M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
              </svg>
              Remove
            </button>
          )}
        </article>
      ))}
    </>
  );
}
