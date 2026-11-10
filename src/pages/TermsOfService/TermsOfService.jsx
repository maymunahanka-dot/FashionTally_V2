import LegalPage from "../Home/LegalPage.jsx";

const policyData = {
  title: "Fashion Tally – Terms of Service",
  lastUpdated: "27th January 2026",
  sections: [
    {
      title: "Welcome to Fashion Tally",
      content:
        'By accessing or using the Fashion Tally platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Service.',
    },
    {
      title: "1. About Fashion Tally",
      content:
        "Fashion Tally is a digital business management platform designed for fashion designers, tailors, fashion retailers, and related fashion entrepreneurs to manage records, inventory, clients, invoices, and financial data. Fashion Tally provides tools, not professional, legal, tax, or accounting advice.",
    },
    {
      title: "2. Eligibility",
      content: "To use Fashion Tally, you must:",
      list: [
        "Be at least 18 years old",
        "Have the legal capacity to enter a binding agreement",
        "Use the Service only for lawful business purposes",
      ],
    },
    {
      title: "3. Account Registration & Responsibility",
      content:
        "You are responsible for maintaining the confidentiality of your login details. All activities under your account are your responsibility. Fashion Tally is not liable for losses caused by unauthorized access due to your negligence. You agree to provide accurate and up-to-date information at all times.",
    },
    {
      title: "4. Subscription, Payments & Billing",
      content:
        "Fashion Tally operates on a paid subscription model. Subscription fees are stated clearly before payment. All payments are non-refundable, unless otherwise stated in writing by Fashion Tally. Failure to complete payment may result in restricted or suspended access. Fashion Tally reserves the right to:",
      list: [
        "Change pricing with prior notice",
        "Introduce new paid features",
        "Offer promotional pricing at its discretion",
      ],
    },
    {
      title: "5. No Refund Policy",
      content: "Once a payment is made:",
      list: [
        "No refunds will be issued for partial use, non-use, or user error",
        "Demo access or trial sessions are provided to help users make informed decisions before payment",
      ],
    },
    {
      title: "6. Acceptable Use Policy",
      content: "You agree NOT to:",
      list: [
        "Use Fashion Tally for fraudulent or illegal activities",
        "Upload false, misleading, or unlawful data",
        "Attempt to hack, reverse-engineer, or misuse the platform",
        "Share or resell access without permission",
      ],
    },
    {
      title: "Violation Consequences",
      content:
        "Violation may lead to immediate suspension or termination without notice.",
    },
    {
      title: "7. Data & User Content",
      content:
        "You retain ownership of your business data. By using Fashion Tally, you grant us permission to store, process, and display your data solely for service delivery. Fashion Tally may use aggregated and anonymized data for analytics, improvements, and reporting. We do not sell user data to third parties.",
    },
    {
      title: "8. Data Accuracy Disclaimer",
      content: "Fashion Tally does not guarantee:",
      list: [
        "Accuracy of user-entered data",
        "Financial correctness if data is entered incorrectly",
        "Compliance with tax laws if records are incomplete or inaccurate",
      ],
    },
    {
      title: "Data Responsibility",
      content:
        "You are fully responsible for reviewing and verifying your records.",
    },
    {
      title: "9. System Availability",
      content:
        "We aim for high availability but do not guarantee uninterrupted access. Downtime may occur due to:",
      list: ["Maintenance", "Updates", "Technical issues beyond our control"],
    },
    {
      title: "Availability Disclaimer",
      content:
        "Fashion Tally is not liable for losses caused by temporary service unavailability.",
    },
    {
      title: "10. Limitation of Liability",
      content: "To the fullest extent permitted by law:",
      list: [
        "Fashion Tally shall not be liable for indirect, incidental, or consequential damages",
        "Including loss of profits, data, reputation, or business opportunities",
      ],
    },
    {
      title: "Risk Acknowledgment",
      content: "Your use of the Service is at your own risk.",
    },
    {
      title: "11. Intellectual Property",
      content: "All platform content including:",
      list: [
        "Software",
        "Branding",
        "Logos",
        "Interface design",
        "Documentation",
      ],
    },
    {
      title: "Property Rights",
      content:
        "Are the exclusive property of Fashion Tally. Unauthorized use is strictly prohibited.",
    },
    {
      title: "12. Termination",
      content: "Fashion Tally may suspend or terminate your account if:",
      list: [
        "You violate these Terms",
        "You misuse the platform",
        "Required payments are not made",
      ],
    },
    {
      title: "Termination Effects",
      content: "Upon termination, access to your account may be revoked.",
    },
    {
      title: "13. Modifications to Terms",
      content:
        "Fashion Tally reserves the right to update these Terms at any time. Continued use of the Service means acceptance of the updated Terms.",
    },
    {
      title: "14. Governing Law",
      content:
        "These Terms shall be governed by the laws of the Federal Republic of Nigeria.",
    },
    {
      title: "15. Contact Information",
      content: "For questions or concerns regarding these Terms:",
      list: [
        "📧 Email: info@fashiontally.com",
        "📞 Phone/WhatsApp: +2349123124709",
      ],
    },
  ],
};

const TermsOfService = () => (
  <LegalPage
    eyebrow="LEGAL / TERMS"
    titleLines={["Terms of Service."]}
    lastUpdated={policyData.lastUpdated}
    intro="Please read these terms carefully before using our platform. By using FashionTally, you agree to these terms."
    sections={policyData.sections}
  />
);

export default TermsOfService;
