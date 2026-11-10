import { Cookie } from "lucide-react";
import LegalPage from "../Home/LegalPage.jsx";

const policyData = {
  title: "Fashion Tally – Cookie Policy",
  lastUpdated: "28th January 2026",
  sections: [
    {
      title: "Introduction",
      content:
        'This Cookie Policy explains how Fashion Tally ("we", "us", or "our") uses cookies and similar technologies when you visit or use our website and application (the "Service"). By continuing to use Fashion Tally, you consent to the use of cookies as described in this policy.',
    },
    {
      title: "1. What Are Cookies?",
      content:
        "Cookies are small text files stored on your device (computer, phone, tablet) when you visit a website or use an app. They help improve functionality, security, and user experience.",
    },
    {
      title: "2. How We Use Cookies",
      content: "Fashion Tally uses cookies to:",
      list: [
        "Ensure the platform functions properly",
        "Remember your login and preferences",
        "Improve performance and speed",
        "Analyze usage patterns to improve features",
        "Enhance security and prevent fraud",
      ],
    },
    {
      title: "Cookie Benefits",
      content: "Cookies help us provide a smooth and reliable experience.",
    },
    {
      title: "3. Types of Cookies We Use",
      content:
        "Fashion Tally uses several types of cookies to enhance your experience:",
    },
    {
      title: "a. Essential Cookies",
      content:
        "These cookies are required for the platform to function properly. Without them, core features such as login, session management, and security may not work. These cookies cannot be disabled.",
    },
    {
      title: "b. Performance & Analytics Cookies",
      content:
        "These cookies help us understand how users interact with Fashion Tally by collecting anonymized usage data such as:",
      list: ["Pages visited", "Feature usage", "Error reports"],
    },
    {
      title: "Analytics Purpose",
      content: "This data helps us improve the platform.",
    },
    {
      title: "c. Functionality Cookies",
      content: "These cookies remember your preferences, such as:",
      list: ["Language", "Saved settings", "User interface choices"],
    },
    {
      title: "Functionality Benefits",
      content: "They improve convenience and personalization.",
    },
    {
      title: "d. Third-Party Cookies",
      content:
        "Some cookies may be placed by trusted third-party services we use for:",
      list: ["Analytics", "Payment processing", "Security monitoring"],
    },
    {
      title: "Third-Party Disclaimer",
      content:
        "Fashion Tally does not control these third-party cookies and is not responsible for their privacy practices.",
    },
    {
      title: "4. What Cookies We Do NOT Use",
      content: "Fashion Tally does not:",
      list: [
        "Sell cookie data to advertisers",
        "Use cookies for aggressive ad tracking",
        "Track users outside the platform for marketing without consent",
      ],
    },
    {
      title: "5. Managing Cookies",
      content: "You can control or disable cookies through:",
      list: ["Your browser settings", "Device preferences"],
    },
    {
      title: "Cookie Management Warning",
      content:
        "Please note: Disabling certain cookies may affect the functionality and performance of Fashion Tally.",
    },
    {
      title: "6. Changes to This Cookie Policy",
      content:
        "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of the Service means you accept the updated policy.",
    },
    {
      title: "7. Contact Us",
      content:
        "If you have any questions about this Cookie Policy, please contact us:",
      list: [
        "📧 Email: info@fashiontally.com",
        "📞 Phone/WhatsApp: +2349023124709",
      ],
    },
  ],
};

/** Small label next to the cookie type headings. */
const badgeFor = (title) => {
  const t = title.toLowerCase();
  if (t.includes("essential")) return <span className="lx-legal-badge">Required</span>;
  if (t.includes("analytics")) return <span className="lx-legal-badge">Analytics</span>;
  if (t.includes("marketing")) return <span className="lx-legal-badge">Marketing</span>;
  return null;
};

const CookiePolicy = () => (
  <LegalPage
    eyebrow="LEGAL / COOKIES"
    titleLines={["Cookie Policy."]}
    lastUpdated={policyData.lastUpdated}
    intro="This policy explains what cookies are, how we use them, and how you can manage your cookie preferences."
    sections={policyData.sections}
    badgeFor={badgeFor}
  >
    <div className="lx-legal-highlight" data-reveal>
      <Cookie size={22} />
      <div>
        <b>Cookie management</b>
        <p>
          You can manage your cookie preferences through your browser settings. Most browsers allow you to view, delete,
          and block cookies. Blocking certain cookies may affect how our website works.
        </p>
      </div>
    </div>
  </LegalPage>
);

export default CookiePolicy;
