// Sends transactional emails via Resend (https://resend.com - free tier: 100/day, 3000/month).
// If RESEND_API_KEY isn't set, this quietly skips sending instead of throwing,
// so the app still works for people who haven't set up email yet.
export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not set - skipping email to ${to}: "${subject}"`);
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Career Console <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error (${res.status}): ${text}`);
  }

  return res.json();
}
