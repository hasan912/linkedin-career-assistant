import { LegalPage, Section, p, ul, muted } from "../_components";

export const metadata = {
  title: "Privacy Policy · Career Console",
  description: "How Career Console collects, uses, and protects your data.",
};

const CONTACT_EMAIL = "support@careerconsole.example"; // TODO: replace with real contact address

const TOC = [
  { id: "introduction", label: "1. Introduction & Data Controller" },
  { id: "data-we-collect", label: "2. What Data We Collect" },
  { id: "how-we-use", label: "3. How We Use Your Data" },
  { id: "third-parties", label: "4. Third-Party Services We Use" },
  { id: "retention", label: "5. Data Retention" },
  { id: "your-rights", label: "6. Your Rights" },
  { id: "cookies", label: "7. Cookies" },
  { id: "security", label: "8. Data Security" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "changes", label: "10. Changes to This Policy" },
  { id: "contact", label: "11. Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" toc={TOC}>
      <Section id="introduction" title="1. Introduction & Data Controller">
        <p style={p}>
          This Privacy Policy explains how Career Console (the &ldquo;Service&rdquo;) collects, uses,
          shares, and protects your personal data, and the rights you have over that data. We are
          committed to handling your data lawfully, fairly, and transparently, in line with the
          principles of the EU General Data Protection Regulation (GDPR) and applicable Pakistani data
          protection norms.
        </p>
        <p style={p}>
          The data controller responsible for your personal data is{" "}
          <strong>Muhammad Hasan Baig</strong>, based in Pakistan. You can reach the controller using
          the contact details in Section 11.
        </p>
      </Section>

      <Section id="data-we-collect" title="2. What Data We Collect">
        <p style={p}>We collect only the data needed to provide the Service:</p>
        <p style={{ ...p, fontWeight: 700 }}>From LinkedIn OAuth</p>
        <ul style={ul}>
          <li>Your name and email address.</li>
          <li>Your LinkedIn member ID.</li>
          <li>
            A LinkedIn access token, which is <strong>encrypted at rest using AES-256-GCM</strong> and
            used only to publish the posts you schedule.
          </li>
        </ul>
        <p style={{ ...p, fontWeight: 700 }}>User-generated data</p>
        <ul style={ul}>
          <li>Scheduled posts and their content.</li>
          <li>Job applications you track and their status.</li>
          <li>
            Resume text and job-description text — these are <strong>not stored permanently</strong>;
            they are processed in memory only to generate AI results and then discarded.
          </li>
          <li>Interview dates and portfolio information you choose to add.</li>
        </ul>
        <p style={{ ...p, fontWeight: 700 }}>Collected automatically</p>
        <ul style={ul}>
          <li>
            Your IP address, used solely for rate limiting to prevent abuse — it is not retained in
            long-term logs.
          </li>
          <li>Basic browser/session information associated with your login session cookie.</li>
        </ul>
      </Section>

      <Section id="how-we-use" title="3. How We Use Your Data">
        <p style={p}>We use your data for the following purposes:</p>
        <ul style={ul}>
          <li>
            <strong>Publishing your posts:</strong> to publish the posts you schedule to your own
            LinkedIn profile via LinkedIn&rsquo;s official Posts API.
          </li>
          <li>
            <strong>Email notifications:</strong> to send interview reminders and optional weekly
            digest emails.
          </li>
          <li>
            <strong>AI processing:</strong> when you use an AI feature (post generation, resume
            analysis, or cover-letter drafting), the relevant text — such as your resume or a job
            description — is sent to a third-party AI provider (Groq, Google Gemini, or Anthropic) to
            generate a result. This text is processed for inference only. It is not stored by us
            beyond the request, and, per those providers&rsquo; policies, is not used to train their
            models. Please avoid including sensitive personal data you do not wish to send for
            processing.
          </li>
          <li>
            <strong>Rate limiting:</strong> your IP address and user ID may be sent to Upstash Redis
            to enforce rate limits. These values are transient and are not permanently stored.
          </li>
        </ul>
        <p style={{ ...p, ...muted, fontSize: 14 }}>
          Our legal bases under the GDPR are: performance of our contract with you (providing the
          Service), your consent (e.g. optional email digests and AI processing you initiate), and our
          legitimate interests (security and abuse prevention).
        </p>
      </Section>

      <Section id="third-parties" title="4. Third-Party Services We Use">
        <p style={p}>
          We rely on the following processors and services. Where data is transferred outside your
          country, we rely on the safeguards offered by these providers.
        </p>
        <ul style={ul}>
          <li>
            <strong>LinkedIn</strong> — OAuth sign-in and the Posts API.
          </li>
          <li>
            <strong>Neon (PostgreSQL)</strong> — database hosting (EU/US servers).
          </li>
          <li>
            <strong>Upstash (Redis)</strong> — rate limiting (EU/US servers).
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery.
          </li>
          <li>
            <strong>Groq / Google Gemini / Anthropic</strong> — AI inference. Text is sent for
            processing only and, per their policies, is not used to train their models.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting.
          </li>
        </ul>
      </Section>

      <Section id="retention" title="5. Data Retention">
        <ul style={ul}>
          <li>
            <strong>Account data:</strong> retained until you delete your account.
          </li>
          <li>
            <strong>Post history:</strong> retained until you delete it.
          </li>
          <li>
            <strong>Session cookies:</strong> expire after 30 days.
          </li>
          <li>
            <strong>Resume / job-description text:</strong> not stored — sent to the AI provider for
            processing and then discarded.
          </li>
        </ul>
      </Section>

      <Section id="your-rights" title="6. Your Rights">
        <p style={p}>
          Subject to applicable law, including the GDPR where it applies to you, you have the right to:
        </p>
        <ul style={ul}>
          <li>
            <strong>Access</strong> your data — you can export it using the Export feature on the
            Analytics page.
          </li>
          <li>
            <strong>Erasure</strong> — delete your account and all associated data at any time.
          </li>
          <li>
            <strong>Object / opt out</strong> — turn off the email digest from the Settings page.
          </li>
          <li>
            <strong>Rectification</strong> — update or correct your information.
          </li>
        </ul>
        <p style={{ ...p, ...muted, fontSize: 14 }}>
          You also have the right to lodge a complaint with your local data protection authority. To
          exercise any right not self-served in the app, contact us using Section 11.
        </p>
      </Section>

      <Section id="cookies" title="7. Cookies">
        <p style={p}>
          We use a single, essential httpOnly session cookie (<code style={{ fontFamily: "var(--font-mono)" }}>lca_session</code>)
          to keep you signed in. We do <strong>not</strong> use tracking cookies, analytics cookies,
          or advertising cookies of any kind.
        </p>
      </Section>

      <Section id="security" title="8. Data Security">
        <ul style={ul}>
          <li>LinkedIn access tokens are encrypted at rest using AES-256-GCM.</li>
          <li>All traffic is served over HTTPS only.</li>
          <li>Rate limiting is applied to help prevent abuse of the Service.</li>
        </ul>
        <p style={{ ...p, ...muted, fontSize: 14 }}>
          No method of transmission or storage is completely secure, but we take reasonable technical
          and organizational measures to protect your data.
        </p>
      </Section>

      <Section id="children" title="9. Children's Privacy">
        <p style={p}>
          The Service is not intended for anyone under the age of 16. We do not knowingly collect
          personal data from children under 16. If you believe a child has provided us with personal
          data, please contact us and we will delete it.
        </p>
      </Section>

      <Section id="changes" title="10. Changes to This Policy">
        <p style={p}>
          We may update this Privacy Policy from time to time. For material changes, we will provide
          notice by email at least <strong>30 days</strong> before the changes take effect. The
          &ldquo;Last updated&rdquo; date at the top of this page reflects the latest revision.
        </p>
      </Section>

      <Section id="contact" title="11. Contact">
        <p style={p}>
          For any privacy questions or to exercise your rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--signal-bright)", textDecoration: "none" }}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p style={{ ...p, ...muted, fontSize: 14 }}>Muhammad Hasan Baig · Pakistan</p>
      </Section>
    </LegalPage>
  );
}
