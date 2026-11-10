import LegalPage from "../Home/LegalPage.jsx";

const policyData = {
  title: "Privacy Policy for Fashion Tally",
  lastUpdated: "23 January 2026",
  sections: [
    {
      title: "Introduction",
      content:
        'Fashion Tally ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, mobile application, services, or interact with our advertisements.',
      list: [],
    },
    {
      title: "1. Information We Collect",
      content:
        "We may collect the following information when you use Fashion Tally or submit a form:",
      list: [
        "Full name",
        "Email address",
        "Phone number",
        "Business information (such as fashion brand name)",
        "Usage data related to how you interact with our platform",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: [
        "Provide and improve Fashion Tally's services",
        "Create and manage user accounts",
        "Communicate with you about demos, updates, and support",
        "Send relevant product information and educational content",
        "Comply with legal, regulatory, and tax requirements",
      ],
    },
    {
      title: "3. Legal Basis for Processing",
      content: "We collect and process your information based on:",
      list: [
        "Your consent (when you submit forms or sign up)",
        "Our legitimate business interests",
        "Legal and regulatory obligations",
      ],
    },
    {
      title: "4. Data Sharing",
      content:
        "We do not sell your personal information. We may share your information only with:",
      list: [
        "Trusted service providers who help operate our platform",
        "Legal or regulatory authorities when required by law",
      ],
    },
    {
      title: "Data Sharing Commitment",
      content:
        "All third parties are required to keep your information secure and confidential.",
      list: [],
    },
    {
      title: "5. Data Security",
      content:
        "We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, or disclosure.",
      list: [],
    },
    {
      title: "6. Data Retention",
      content:
        "We retain personal information only for as long as necessary to:",
      list: [
        "Fulfill the purposes outlined in this policy",
        "Meet legal, accounting, or regulatory requirements",
      ],
    },
    {
      title: "7. Your Rights",
      content: "You have the right to:",
      list: [
        "Request access to your personal data",
        "Request correction or deletion of your data",
        "Withdraw consent at any time",
        "Request information about how your data is used",
      ],
    },
    {
      title: "Exercising Your Rights",
      content: "You can exercise these rights by contacting us.",
      list: [],
    },
    {
      title: "8. Cookies and Tracking",
      content:
        "We may use cookies or similar technologies to improve user experience, analyze traffic, and optimize our services.",
      list: [],
    },
    {
      title: "9. Third-Party Links",
      content:
        "Fashion Tally may contain links to third-party websites. We are not responsible for the privacy practices of those websites.",
      list: [],
    },
    {
      title: "10. Updates to This Policy",
      content:
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.",
      list: [],
    },
    {
      title: "11. Contact Us",
      content:
        "If you have any questions about this Privacy Policy or how we handle your data, please contact us at:",
      list: [
        "Email: info@fashiontally.com",
        "Website: https://fashiontally.com",
      ],
    },
  ],
};

const PrivacyPolicy = () => (
  <LegalPage
    eyebrow="LEGAL / PRIVACY"
    titleLines={["Privacy Policy."]}
    lastUpdated={policyData.lastUpdated}
    intro="We are committed to protecting your personal information and being transparent about how we use it."
    sections={policyData.sections}
  />
);

export default PrivacyPolicy;
