"use client";

import { useEffect, useState } from "react";

function formatDateTimeLocal(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function PostsClient() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!content.trim() || !scheduledFor) {
      setError("Write something and pick a date/time first.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, scheduledFor }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      setScheduledFor("");
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
            <label>Publish at</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
          {error && (
            <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button type="submit" className="btn" disabled={loading}>
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
