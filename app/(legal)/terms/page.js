import { LegalPage, Section, p, ul, muted } from "../_components";

export const metadata = {
  title: "Terms of Service · Career Console",
  description: "The terms governing your use of Career Console.",
};

const CONTACT_EMAIL = "support@careerconsole.example"; // TODO: replace with real contact address

const TOC = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "description", label: "2. Description of Service" },
  { id: "linkedin", label: "3. LinkedIn API Usage" },
  { id: "accounts", label: "4. User Accounts" },
  { id: "ai-content", label: "5. AI-Generated Content" },
  { id: "acceptable-use", label: "6. Acceptable Use" },
  { id: "data-privacy", label: "7. Data and Privacy" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "termination", label: "9. Termination" },
  { id: "changes", label: "10. Changes to Terms" },
  { id: "governing-law", label: "11. Governing Law" },
  { id: "contact", label: "12. Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" toc={TOC}>
      <Section id="acceptance" title="1. Acceptance of Terms">
        <p style={p}>
          By accessing or using Career Console (the &ldquo;Service&rdquo;), you agree to be bound by
          these Terms of Service (the &ldquo;Terms&rdquo;). If you do not agree with any part of
          these Terms, you must not use the Service. These Terms constitute a legally binding
          agreement between you and the operator of Career Console, Muhammad Hasan Baig, based in
          Pakistan.
        </p>
      </Section>

      <Section id="description" title="2. Description of Service">
        <p style={p}>
          Career Console is a personal career productivity tool that helps you schedule and publish
          posts to your own LinkedIn profile via LinkedIn&rsquo;s official API, aggregate public job
          listings, track your job applications in a personal pipeline, and use AI to draft LinkedIn
          posts, analyze resumes, and write cover letters. The Service also sends optional email
          reminders and digests, and offers a browser extension for saving job leads.
        </p>
        <p style={p}>
          The Service does not scrape LinkedIn, automate browsing, auto-apply to jobs, or send
          messages on your behalf. It interacts with LinkedIn only through LinkedIn&rsquo;s sanctioned
          APIs.
        </p>
      </Section>

      <Section id="linkedin" title="3. LinkedIn API Usage">
        <ul style={ul}>
          <li>
            We use LinkedIn&rsquo;s official API only. We do not scrape LinkedIn or automate its
            website in any way.
          </li>
          <li>
            By connecting your account, you grant us permission to publish posts to your LinkedIn
            profile on your behalf, at the times you schedule them.
          </li>
          <li>
            You are solely responsible for the content you create, schedule, and publish through the
            Service, including ensuring it is lawful and does not infringe the rights of others.
          </li>
          <li>
            Career Console is an independent product and is <strong>not affiliated with, endorsed by,
            or sponsored by LinkedIn Corporation.</strong> &ldquo;LinkedIn&rdquo; is a trademark of
            LinkedIn Corporation.
          </li>
        </ul>
      </Section>

      <Section id="accounts" title="4. User Accounts">
        <ul style={ul}>
          <li>Accounts are created and accessed exclusively through LinkedIn OAuth sign-in.</li>
          <li>
            You must comply with LinkedIn&rsquo;s own Terms of Service and policies at all times when
            using the Service. Nothing in these Terms overrides your obligations to LinkedIn.
          </li>
          <li>
            We may suspend or terminate any account that violates these Terms, abuses the Service, or
            creates risk or possible legal exposure for us or other users.
          </li>
        </ul>
      </Section>

      <Section id="ai-content" title="5. AI-Generated Content">
        <ul style={ul}>
          <li>
            AI-generated suggestions — including posts, resume analysis, and cover letters — are{" "}
            <strong>drafts only</strong>. You are expected to review and edit them before publishing
            or submitting them anywhere.
          </li>
          <li>
            We do not guarantee the accuracy, completeness, or suitability of any AI-generated
            content. You use it at your own discretion and risk.
          </li>
          <li>
            Any salary estimates or market figures are general guidance only and do not constitute
            professional, financial, legal, or career advice.
          </li>
        </ul>
      </Section>

      <Section id="acceptable-use" title="6. Acceptable Use">
        <p style={p}>You agree not to use the Service to:</p>
        <ul style={ul}>
          <li>Send spam, or publish misleading, deceptive, or unlawful content.</li>
          <li>Engage in automated abuse, or attempt to circumvent rate limits or security controls.</li>
          <li>Share your account access or credentials with any other person.</li>
          <li>
            Violate any applicable law, the rights of others, or the terms of any third-party service
            (including LinkedIn) accessed through the Service.
          </li>
        </ul>
      </Section>

      <Section id="data-privacy" title="7. Data and Privacy">
        <p style={p}>
          Your use of the Service is also governed by our{" "}
          <a href="/privacy" style={{ color: "var(--signal-bright)", textDecoration: "none" }}>
            Privacy Policy
          </a>
          , which explains what data we collect, how we use it, and the rights you have over it. By
          using the Service, you consent to that processing.
        </p>
      </Section>

      <Section id="liability" title="8. Limitation of Liability">
        <ul style={ul}>
          <li>
            The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
            <strong>&ldquo;as available&rdquo;</strong>, without warranties of any kind, whether
            express or implied.
          </li>
          <li>
            We are not liable for actions taken against your LinkedIn account by LinkedIn or by any
            third party, including suspension or restriction of your LinkedIn account.
          </li>
          <li>
            To the maximum extent permitted by law, our total aggregate liability arising out of or
            relating to the Service is capped at the total amount you paid us, if any, in the three
            (3) months preceding the event giving rise to the claim.
          </li>
        </ul>
      </Section>

      <Section id="termination" title="9. Termination">
        <ul style={ul}>
          <li>You may delete your account and all associated data at any time from your settings.</li>
          <li>
            We may suspend or terminate your access to the Service, with or without notice, for any
            violation of these Terms.
          </li>
        </ul>
      </Section>

      <Section id="changes" title="10. Changes to Terms">
        <p style={p}>
          We may update these Terms from time to time. For material changes, we will provide at least
          <strong> 30 days&rsquo; notice by email</strong> before the changes take effect. Your
          continued use of the Service after the effective date constitutes acceptance of the revised
          Terms.
        </p>
      </Section>

      <Section id="governing-law" title="11. Governing Law">
        <p style={p}>
          These Terms are governed by and construed in accordance with the laws of the Islamic
          Republic of Pakistan, without regard to its conflict-of-laws principles. You agree to submit
          to the exclusive jurisdiction of the courts of Pakistan for any dispute arising out of or
          relating to these Terms or the Service.
        </p>
      </Section>

      <Section id="contact" title="12. Contact">
        <p style={p}>
          Questions about these Terms can be sent to{" "}
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
