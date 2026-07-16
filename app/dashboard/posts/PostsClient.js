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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageUrn, setImageUrn] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

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

    // Convert the 12-hour picker into 24-hour, then convert the chosen
    // timezone's wall-clock time into a correct UTC instant.
    let hour24 = hour12 % 12;
    if (ampm === "PM") hour24 += 12;
    const scheduledForUtc = zonedTimeToUtc(dateStr, hour24, minute, timeZone).toISOString();

    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, scheduledFor: scheduledForUtc, imageUrn }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      removeImage();
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
              {p.imageUrn && <span className="meta">📷 Photo attached</span>}
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
