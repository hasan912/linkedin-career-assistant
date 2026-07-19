"use client";

import { useEffect, useState } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const STATUS_COLORS = {
  saved: "#94A0AE", applied: "#4E8C82", interview: "#F59E0B",
  offer: "#22C55E", rejected: "#EF4444",
};

/* Animated circular progress ring (SVG) */
function ProgressRing({ value, max = 100, size = 180, stroke = 12, color, children }) {
  const [animated, setAnimated] = useState(0);
  const pct = Math.max(0, Math.min(value / max, 1));

  useEffect(() => {
    // Animate on mount / value change via CSS transition on dash offset
    const t = requestAnimationFrame(() => setAnimated(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);

  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} role="img" aria-label={`${Math.round(pct * 100)} percent`}>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6FB3A8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ink-raised)" strokeWidth={stroke} />
        <circle
          cx={c} cy={c} r={r} fill="none"
          stroke={color || "url(#ring-grad)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - animated)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border-strong bg-ink-soft px-3 py-2 text-[12px] shadow-[var(--shadow-pop)]">
      {label && <div className="mb-0.5 font-bold text-paper">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="text-paper-dim">
          {p.name}: <span className="font-bold text-paper">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsClient() {
  const [data, setData] = useState(null);
  const [prefs, setPrefs] = useState({ dailyGoal: 5, digestEmail: true });
  const [goalInput, setGoalInput] = useState(5);
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p || p.error) return; // keep defaults if unauthorized / user missing
        setPrefs(p);
        setGoalInput(p.dailyGoal || 5);
      })
      .catch(() => {});
  }, []);

  async function saveGoal() {
    setSaving(true);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoal: Number(goalInput) }),
    });
    setPrefs((p) => ({ ...p, dailyGoal: Number(goalInput) }));
    setSaving(false);
  }

  async function toggleDigest() {
    const next = !prefs.digestEmail;
    setPrefs((p) => ({ ...p, digestEmail: next }));
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digestEmail: next }),
    });
  }

  function exportData() {
    setExportLoading(true);
    window.location.href = "/api/user/export";
    setTimeout(() => setExportLoading(false), 2000);
  }

  if (!data) {
    return (
      <div aria-label="Loading analytics">
        <div className="mb-6 flex justify-center"><div className="skeleton h-[220px] w-[220px] !rounded-full" /></div>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-[96px]" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="skeleton h-[260px]" />
          <div className="skeleton h-[260px]" />
        </div>
      </div>
    );
  }

  const pieData = Object.entries(data.byStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const goalDone = Math.min(data.todayCount, prefs.dailyGoal || 1);
  const goalPct = data.todayCount / (prefs.dailyGoal || 1);
  const goalColor = goalPct >= 1 ? "#22C55E" : goalPct >= 0.5 ? "#F59E0B" : undefined;

  return (
    <>
      {/* Hero stat: response rate ring */}
      <section className="card card-hover mb-6 flex flex-col items-center !py-9 text-center" aria-label="Response rate">
        <ProgressRing value={data.responseRate} max={100} size={200} stroke={13}>
          <span className="text-[42px] font-black leading-none tracking-tight">
            {data.responseRate}<span className="text-[24px] text-paper-dim">%</span>
          </span>
          <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-paper-dim">Response Rate</span>
        </ProgressRing>
        <p className="m-0 mt-4 max-w-sm text-[13px] text-paper-dim">
          Interviews and offers as a share of every application you&rsquo;ve sent.
        </p>
      </section>

      {/* Stats row */}
      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Key numbers">
        {[
          { label: "Total Leads", value: data.total },
          { label: "Applied", value: data.byStatus.applied },
          { label: "Interviews", value: data.byStatus.interview },
          { label: "Offers", value: data.byStatus.offer },
          { label: "Posts Published", value: data.posts },
          { label: "Posts Queued", value: data.pendingPosts },
        ].map((s) => (
          <div className="card card-hover !mb-0 !p-5 text-center" key={s.label}>
            <div className="text-[30px] font-extrabold leading-none tracking-tight">{s.value}</div>
            <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-paper-dim">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Donut: applications by status */}
        <section className="card !mb-0" aria-label="Applications by status">
          <div className="card-title">Applications by Status</div>
          {pieData.length === 0 ? (
            <div className="empty !border-none !py-14">No applications yet.</div>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-[220px] w-[220px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      cornerRadius={5}
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#888"} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[30px] font-black leading-none">{data.total}</span>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-paper-dim">total</span>
                </div>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {pieData.map((entry) => (
                  <li key={entry.name} className="flex items-center gap-2.5 text-[13px]">
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-[4px]"
                      style={{ background: STATUS_COLORS[entry.name] }}
                      aria-hidden="true"
                    />
                    <span className="capitalize text-paper-dim">{entry.name}</span>
                    <span className="font-extrabold">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Area: applications over time */}
        <section className="card !mb-0" aria-label="Applications over time">
          <div className="card-title">Applications Over Time (last 12 weeks)</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.byWeek} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4E8C82" stopOpacity={0.55} />
                  <stop offset="55%" stopColor="#6366F1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--paper-dim)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--paper-dim)" }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="applications"
                stroke="#6FB3A8"
                strokeWidth={2.5}
                fill="url(#area-grad)"
                dot={false}
                activeDot={{ r: 5, fill: "#6FB3A8", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Daily goal + preferences */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_1fr]">
        <section className="card card-hover !mb-0 flex flex-col items-center !px-9 text-center" aria-label="Daily goal">
          <div className="card-title self-start">Daily Goal</div>
          <ProgressRing value={goalDone} max={prefs.dailyGoal || 1} size={150} stroke={11} color={goalColor}>
            <span className="text-[30px] font-black leading-none">{data.todayCount}</span>
            <span className="text-[11px] font-semibold text-paper-dim">of {prefs.dailyGoal}</span>
          </ProgressRing>
          <p className="m-0 mt-2 text-[12.5px] text-paper-dim">
            {data.todayCount} of {prefs.dailyGoal} applications today
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              aria-label="Daily application goal"
              className="w-[64px] rounded-lg border border-border bg-ink-raised px-2.5 py-2 text-center text-[14px] font-bold text-paper transition-colors duration-200 focus:border-signal focus:outline-none"
            />
            <button className="btn btn-ghost !px-4 !py-2 !text-[12.5px]" onClick={saveGoal} disabled={saving}>
              {saving ? "Saved ✓" : "Set goal"}
            </button>
          </div>
        </section>

        <section className="card !mb-0" aria-label="Preferences">
          <div className="card-title">Preferences</div>
          <button
            type="button"
            role="switch"
            aria-checked={!!prefs.digestEmail}
            onClick={toggleDigest}
            className="mb-5 flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent p-0 text-left"
          >
            <span>
              <span className="block text-[14px] font-semibold text-paper">Weekly email digest</span>
              <span className="mt-0.5 block text-[12.5px] text-paper-dim">
                Posts published, applications sent, upcoming interviews.
              </span>
            </span>
            <span className={"switch " + (prefs.digestEmail ? "switch-on" : "")} aria-hidden="true" />
          </button>

          <button className="btn w-full !py-3" onClick={exportData} disabled={exportLoading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d="M12 3v12M7 10l5 5 5-5M4 19h16" />
            </svg>
            {exportLoading ? "Preparing…" : "Export all data (JSON)"}
          </button>
        </section>
      </div>
    </>
  );
}
