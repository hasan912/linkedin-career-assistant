import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";

// Pulls "web developer" job listings from two legitimate, ToS-compliant sources:
//  1) Adzuna (https://developer.adzuna.com) - free API key required, aggregates many job boards
//  2) RemoteOK (https://remoteok.com/api) - public, no key required, remote jobs only
// This gives the user a live feed to browse; they apply manually via the links,
// which respects each platform's terms of service.
export async function GET(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "web developer";
  const location = searchParams.get("location") || "";

  const jobs = [];

  // --- Adzuna ---
  try {
    if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
      const country = "us"; // change to "gb", "in", "pk" (if supported) etc. as needed
      const adzunaUrl = new URL(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1`
      );
      adzunaUrl.searchParams.set("app_id", process.env.ADZUNA_APP_ID);
      adzunaUrl.searchParams.set("app_key", process.env.ADZUNA_APP_KEY);
      adzunaUrl.searchParams.set("what", query);
      if (location) adzunaUrl.searchParams.set("where", location);
      adzunaUrl.searchParams.set("results_per_page", "20");

      const res = await fetch(adzunaUrl.toString());
      if (res.ok) {
        const data = await res.json();
        for (const j of data.results || []) {
          jobs.push({
            source: "Adzuna",
            title: j.title,
            company: j.company?.display_name || "Unknown",
            location: j.location?.display_name || "",
            url: j.redirect_url,
            posted: j.created,
          });
        }
      }
    }
  } catch (e) {
    console.error("Adzuna fetch failed", e);
  }

  // --- RemoteOK ---
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "career-assistant-app" },
    });
    if (res.ok) {
      const data = await res.json();
      const listings = Array.isArray(data) ? data.slice(1) : []; // first element is metadata
      const filtered = listings.filter((j) =>
        (j.position || "").toLowerCase().includes("developer") ||
        (j.tags || []).some((t) => t.toLowerCase().includes("dev"))
      );
      for (const j of filtered.slice(0, 20)) {
        jobs.push({
          source: "RemoteOK",
          title: j.position,
          company: j.company,
          location: j.location || "Remote",
          url: j.url,
          posted: j.date,
        });
      }
    }
  } catch (e) {
    console.error("RemoteOK fetch failed", e);
  }

  return NextResponse.json({ jobs });
}
