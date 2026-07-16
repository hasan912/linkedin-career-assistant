// Converts a wall-clock date/time as entered by the user in a specific timezone
// into the correct absolute UTC instant, using only built-in Intl APIs.
//
// Example: zonedTimeToUtc("2026-07-16", 15, 30, "Asia/Karachi")
// -> a Date object representing 2026-07-16 15:30 Pakistan time, correctly
//    converted to UTC (10:30 UTC), regardless of what timezone the server runs in.
export function zonedTimeToUtc(dateStr, hour24, minute, timeZone) {
  const hh = String(hour24).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  // First guess: treat the wall-clock numbers as if they were already UTC.
  const guess = new Date(`${dateStr}T${hh}:${mm}:00Z`);

  // Ask: "if this UTC instant is displayed in the target timezone, what wall-clock
  // time does it show?" The difference between that and our intended wall-clock
  // time tells us the timezone's offset, which we then apply as a correction.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(guess).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  // formatToParts can return "24" for midnight in hour12:false edge cases on some engines
  const hourFixed = parts.hour === "24" ? "00" : parts.hour;

  const asIfUtc = new Date(
    `${parts.year}-${parts.month}-${parts.day}T${hourFixed}:${parts.minute}:${parts.second}Z`
  );
  const offsetMs = guess.getTime() - asIfUtc.getTime();

  return new Date(guess.getTime() + offsetMs);
}

// A practical list of common IANA timezones for the dropdown, roughly ordered by UTC offset.
export const COMMON_TIMEZONES = [
  "Pacific/Midway", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
  "America/Denver", "America/Chicago", "America/New_York", "America/Sao_Paulo",
  "Atlantic/Azores", "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Europe/Moscow", "Africa/Cairo", "Africa/Nairobi", "Asia/Dubai", "Asia/Karachi",
  "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Shanghai", "Asia/Singapore",
  "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
];

// Detects the browser's own timezone, falling back to Asia/Karachi if unavailable.
export function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
  } catch {
    return "Asia/Karachi";
  }
}
