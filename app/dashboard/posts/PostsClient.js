"use client";

import { useEffect, useRef, useState } from "react";
import { zonedTimeToUtc, COMMON_TIMEZONES, detectBrowserTimezone } from "@/lib/timezone";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59

export default function PostsClient() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [dateStr, setDateStr] = useState(todayStr());
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");
  const [timeZone, setTimeZone] = useState(detectBrowserTimezone());
  const [repeat, setRepeat] = useState("none");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageUrn, setImageUrn] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // AI post generator state
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
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

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageUrn(null);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/posts/upload-image", { method: "POST", body: formData });
    setUploadingImage(false);

    if (res.ok) {
      const data = await res.json();
      setImageUrn(data.imageUrn);
    } else {
      const data = await res.json().catch(() => ({}));
      setUploadError(data.error || "Couldn't upload image to LinkedIn.");
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageUrn(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Write something first.");
      return;
    }
    if (uploadingImage) {
      setError("Image is still uploading — wait a moment.");
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
        imageUrn,
        repeat,
        timeZone,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      removeImage();
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

  return (
    <>
      <div className="card">
        <div className="card-title">Schedule a new post</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowAiPanel((s) => !s)}
            >
              ✨ {showAiPanel ? "Hide" : "Generate with AI"}
            </button>
          </div>

          {showAiPanel && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
                background: "var(--ink)",
              }}
            >
              <div className="field">
                <label>Topic</label>
                <input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. why I switched from Python to Next.js"
                />
              </div>
              <div className="row" style={{ gap: 12, alignItems: "flex-end" }}>
                <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Tone</label>
                  <select value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Storytelling">Storytelling</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <button type="button" className="btn" onClick={handleGenerateWithAi} disabled={aiLoading}>
                  {aiLoading ? "Writing…" : "Generate"}
                </button>
              </div>
              {aiError && (
                <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10, marginBottom: 0 }}>
                  {aiError}
                </p>
              )}
            </div>
          )}

          <div className="field">
            <label>Post content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share on LinkedIn?"
            />
          </div>

          <div className="field">
            <label>Photo (optional)</label>
            {!imagePreviewUrl && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageSelect}
              />
            )}
            {imagePreviewUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={imagePreviewUrl}
                  alt="Selected attachment preview"
                  style={{ maxWidth: 240, borderRadius: 8, display: "block", marginBottom: 8 }}
                />
                {uploadingImage && <span className="meta">Uploading to LinkedIn…</span>}
                {imageUrn && !uploadingImage && (
                  <span className="meta" style={{ color: "var(--signal-bright)" }}>
                    ✓ Ready to attach
                  </span>
                )}
                <div>
                  <button type="button" className="btn btn-danger" style={{ marginTop: 8 }} onClick={removeImage}>
                    Remove photo
                  </button>
                </div>
              </div>
            )}
            {uploadError && (
              <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 6 }}>{uploadError}</p>
            )}
          </div>

          <div className="field">
            <label>Publish date</label>
            <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
          </div>

          <div className="row" style={{ gap: 12, marginBottom: 16, alignItems: "flex-end" }}>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label>Hour</label>
              <select value={hour12} onChange={(e) => setHour12(Number(e.target.value))}>
                {HOURS_12.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label>Minute</label>
              <select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                {MINUTES.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label>&nbsp;</label>
              <select value={ampm} onChange={(e) => setAmpm(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Timezone</label>
            <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
              {!COMMON_TIMEZONES.includes(timeZone) && (
                <option value={timeZone}>{timeZone} (detected)</option>
              )}
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Repeat</label>
            <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option value="none">Doesn't repeat</option>
              <option value="daily">Daily, at this same time</option>
              <option value="weekly">Weekly, on this same day and time</option>
            </select>
          </div>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button type="submit" className="btn" disabled={loading || uploadingImage}>
            {loading ? "Scheduling…" : "Schedule Post"}
          </button>
        </form>
      </div>

      <div className="card-title" style={{ marginTop: 32 }}>Your posts</div>
      {posts.length === 0 && <div className="empty">No posts scheduled yet.</div>}
      {posts.map((p) => (
        <div className="card" key={p.id}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.6 }}>{p.content}</p>
              {p.imageUrn && <span className="meta">📷 Photo attached &nbsp; </span>}
              {p.repeat !== "none" && <span className="meta">🔁 Repeats {p.repeat} &nbsp; </span>}
              <br />
              <span className="meta">
                {p.status === "posted" && p.postedAt
                  ? `Published ${new Date(p.postedAt).toLocaleString()}`
                  : `Scheduled for ${new Date(p.scheduledFor).toLocaleString()}`}
              </span>
              {p.status === "failed" && p.errorMessage && (
                <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>
                  {p.errorMessage}
                </p>
              )}
            </div>
            <span className={`pill pill-${p.status}`}>{p.status}</span>
          </div>
          {p.status === "pending" && (
            <button
              className="btn btn-danger"
              style={{ marginTop: 12 }}
              onClick={() => handleDelete(p.id)}
            >
              Cancel
            </button>
          )}
        </div>
      ))}
    </>
  );
}
