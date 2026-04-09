import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaFileAlt,
} from "react-icons/fa";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaScissors,
  FaComments,
  FaBolt,
} from "react-icons/fa6";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "./Contact.css";
import second from "./../../assets/Image/logog.png";

// Custom hook for scroll animations
const useScrollAnimation = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const contactMethods = [
  {
    title: "Email Us",
    description: "Reach out for support, sales, or general inquiries",
    contact: "fashiontallyy@gmail.com",
    availability: "24/7",
    responseTime: "Within 24hrs",
    action: "Send Email",
    icon: FaEnvelope,
    color: "from-teal-500 to-teal-600",
    href: "mailto:support@fashiontally.com",
  },
  {
    title: "Call Our Office",
    description: "Speak directly with our business team",
    contact: "+2349123124709",
    availability: "Mon – Fri",
    responseTime: "9am – 5pm",
    action: "Call Now",
    icon: FaPhone,
    color: "from-indigo-500 to-indigo-600",
    href: "tel:+2349123124709",
  },
  {
    title: "Follow on Twitter",
    description: "Product updates, tips, and announcements",
    contact: "@fashiontally",
    availability: "Active",
    responseTime: "Fast replies",
    action: "Follow",
    icon: FaTwitter,
    color: "from-sky-500 to-sky-600",
    href: "https://x.com/fashion_tally?s=11",
  },
  {
    title: "Instagram",
    description: "Community stories and fashion inspiration",
    contact: "@fashiontally",
    availability: "Daily posts",
    responseTime: "DMs open",
    action: "Visit Instagram",
    icon: FaInstagram,
    color: "from-pink-500 to-purple-600",
    href: "https://www.instagram.com/fashiontallyapp?igsh=Yzc2bjE3N3FwMXpj&utm_source=qr",
  },
  {
    title: "LinkedIn",
    description: "Professional network and business updates",
    contact: "fashiontally",
    availability: "Daily posts",
    responseTime: "DMs open",
    action: "Visit LinkedIn",
    icon: FaLinkedin,
    color: "from-blue-500 to-blue-600",
    href: "https://www.linkedin.com/company/fashion-tally/",
  },
];

const supportStats = [
  {
    icon: FaUsers,
    number: "500+",
    label: "Happy Customers",
    description: "Fashion designers trust us",
  },
  {
    icon: FaClock,
    number: "< 5min",
    label: "Response Time",
    description: "Average chat response",
  },
  {
    icon: FaStar,
    number: "4.9/5",
    label: "Customer Rating",
    description: "Based on 200+ reviews",
  },
  {
    icon: FaCheckCircle,
    number: "99.9%",
    label: "Uptime",
    description: "Reliable service guarantee",
  },
];

const faqs = [
  {
    question: "How quickly can I get started?",
    answer:
      "You can start using FashionTally immediately after signing up. Our onboarding process takes less than 10 minutes, and we provide guided tutorials to help you set up your first clients and orders. Plus, our team offers free onboarding calls to ensure you're set up for success.",
    category: "Getting Started",
  },
  {
    question: "Do you offer training and support?",
    answer:
      "Absolutely! We provide comprehensive onboarding, video tutorials, documentation, live chat support, and ongoing customer success management. Our team includes former fashion designers who understand your unique challenges and can provide industry-specific guidance.",
    category: "Support",
  },
  {
    question: "Can I import my existing client data?",
    answer:
      "Yes! We support importing client data from Excel/CSV files, and our team can help migrate data from other systems like spreadsheets, other CRMs, or manual records. We also offer free data migration assistance for all new customers.",
    category: "Data Migration",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We use enterprise-grade encryption, secure cloud hosting with AWS, regular automated backups, and comply with international data protection standards. Your data is protected with the same security measures used by major financial institutions.",
    category: "Security",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, bank transfers, and mobile money payments including Paystack, Flutterwave, and other Nigerian payment providers. All transactions are secured with 256-bit SSL encryption.",
    category: "Billing",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time with no cancellation fees. Your data remains accessible for 30 days after cancellation, giving you time to export your information if needed.",
    category: "Billing",
  },
];

const Contact = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    priority: "medium",
  });

  useScrollAnimation();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      subject: "",
      message: "",
      priority: "medium",
    });
    alert("Message sent successfully! We'll get back to you within 24 hours.");
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const categories = [
    "All",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="contact_landing-page">
      <nav className="contact_nav-bar">
        <div className="contact_nav-container">
          <div className="contact_nav-content">
            <div className="contact_nav-logo">
              <img src={second} alt="logo" className="contact_logo-image" />
              <span className="contact_logo-textt">FashionTally</span>
            </div>
            <div className="contact_nav-links-desktop">
              <a href="/" className="contact_nav-link">
                Home
              </a>
              <a href="/#featurees" className="contact_nav-link">
                Features
              </a>
              <a href="/#pricing" className="contact_nav-link">
                Pricing
              </a>
              <a href="/about" className="contact_nav-link">
                About
              </a>
              <a
                href="/contact"
                className="contact_nav-link contact_nav-link-active"
              >
                Contact
              </a>
              <div className="contact_nav-buttons">
                <button
                  className="contact_btn-outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="contact_btn-primaryy"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="contact_nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="contact_menu-btn"
              >
                {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="contact_nav-mobile-menu"
            style={{
              animation: isMenuOpen
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
          >
            <a
              href="/"
              className="contact_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/#featurees"
              className="contact_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="contact_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/about"
              className="contact_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="contact_nav-mobile-link contact_nav-mobile-link-active"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="contact_nav-mobile-buttons">
              <button
                className="contact_btn-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="contact_btn-primaryy"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="contact_hero-section">
        <div className="contact_hero-container">
          <div className="contact_hero-content scroll-animate">
            <div className="contact_hero-badge">Get in Touch</div>
            <h1 className="contact_hero-title">
              We're Here to{" "}
              <span className="contact_hero-title-gradient">
                Help You Succeed
              </span>
            </h1>
            <p className="contact_hero-subtitle">
              Have questions about FashionTally? Want to see a demo? Or need
              help getting started? Our team is ready to assist you on your
              fashion business journey.
            </p>
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="contact_stats-section">
        <div className="contact_stats-container">
          <div className="contact_stats-grid">
            {supportStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="contact_stat-item scroll-animate"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="contact_stat-icon">
                    <Icon size={32} />
                  </div>
                  <div className="contact_stat-number">{stat.number}</div>
                  <div className="contact_stat-label">{stat.label}</div>
                  <div className="contact_stat-description">
                    {stat.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact_methods-section">
        <div className="contact_methods-container">
          <div className="contact_methods-header scroll-animate">
            <div className="contact_methods-badge">Contact</div>
            <h2 className="contact_methods-title">
              Get in <span className="contact_text-gradient">Touch</span>
            </h2>
            <p className="contact_methods-subtitle">
              Reach us via email, phone, or social platforms — we're always
              happy to help.
            </p>
          </div>

          <div className="contact_methods-grid">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div
                  key={index}
                  className="contact_method-card scroll-animate"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="contact_method-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="contact_method-title">{method.title}</h3>
                  <p className="contact_method-description">
                    {method.description}
                  </p>
                  <div className="contact_method-details">
                    <p className="contact_method-contact">{method.contact}</p>
                    <div className="contact_method-info">
                      <span>{method.availability}</span>
                      <span>{method.responseTime}</span>
                    </div>
                  </div>
                  <a
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact_method-button"
                  >
                    {method.action}
                    <FaExternalLinkAlt size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="contact_form-section">
        <div className="contact_form-container">
          <div className="contact_form-grid">
            {/* Contact Form */}
            <div className="contact_form-wrapper scroll-animate">
              <div className="contact_form-card">
                <div className="contact_form-header">
                  <h2 className="contact_form-title">Send us a Message</h2>
                  <p className="contact_form-description">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="contact_form">
                  <div className="contact_form-row">
                    <div className="contact_form-field">
                      <label htmlFor="name" className="contact_form-label">
                        <FaUsers size={16} />
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="contact_form-input"
                        required
                      />
                    </div>
                    <div className="contact_form-field">
                      <label htmlFor="email" className="contact_form-label">
                        <FaEnvelope size={16} />
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="contact_form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="contact_form-row">
                    <div className="contact_form-field">
                      <label htmlFor="company" className="contact_form-label">
                        <FaScissors size={16} />
                        Company/Brand Name
                      </label>
                      <input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your fashion brand name"
                        className="contact_form-input"
                      />
                    </div>
                    <div className="contact_form-field">
                      <label htmlFor="phone" className="contact_form-label">
                        <FaPhone size={16} />
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234 xxx xxx xxxx"
                        className="contact_form-input"
                      />
                    </div>
                  </div>

                  <div className="contact_form-row">
                    <div className="contact_form-field">
                      <label htmlFor="subject" className="contact_form-label">
                        <FaFileAlt size={16} />
                        Subject *
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What can we help you with?"
                        className="contact_form-input"
                        required
                      />
                    </div>
                    <div className="contact_form-field">
                      <label htmlFor="priority" className="contact_form-label">
                        <FaBolt size={16} />
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="contact_form-select"
                      >
                        <option value="low">Low - General inquiry</option>
                        <option value="medium">Medium - Need assistance</option>
                        <option value="high">High - Urgent issue</option>
                      </select>
                    </div>
                  </div>

                  <div className="contact_form-field">
                    <label htmlFor="message" className="contact_form-label">
                      <FaComments size={16} />
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you... Please include any specific details about your fashion business or the challenges you're facing."
                      rows={6}
                      className="contact_form-textarea"
                      required
                    />
                  </div>

                  <div className="contact_form-info">
                    <div className="contact_form-info-content">
                      <FaCheckCircle size={20} />
                      <div>
                        <p className="contact_form-info-title">
                          What happens next?
                        </p>
                        <ul className="contact_form-info-list">
                          <li>
                            • We'll respond within 24 hours (usually much
                            faster!)
                          </li>
                          <li>
                            • High priority issues get immediate attention
                          </li>
                          <li>
                            • We may schedule a call to better understand your
                            needs
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="contact_form-submit">
                    <FaPaperPlane size={16} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info & FAQ */}
            <div className="contact_info-wrapper scroll-animate">
              {/* Office Info */}
              <div className="contact_office-card">
                <div className="contact_office-header">
                  <h3 className="contact_office-title">
                    <FaMapMarkerAlt size={20} />
                    Visit Our Office
                  </h3>
                  <p className="contact_office-description">
                    We'd love to meet you in person!
                  </p>
                </div>
                <div className="contact_office-content">
                  <div className="contact_office-item">
                    <FaMapMarkerAlt size={20} />
                    <div>
                      <p className="contact_office-label">
                        FashionTally Headquarters
                      </p>
                      <p className="contact_office-text">
                        No 1 Gidado Road
                        <br />
                        Kano, Kano State
                        <br />
                        Nigeria
                      </p>
                    </div>
                  </div>

                  <div className="contact_office-item">
                    <FaClock size={20} />
                    <div>
                      <p className="contact_office-label">Business Hours</p>
                      <div className="contact_office-text">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM WAT</p>
                        <p>Saturday: 10:00 AM - 2:00 PM WAT</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>

                  <div className="contact_office-item">
                    <FaPhone size={20} />
                    <div>
                      <p className="contact_office-label">Direct Line</p>
                      <p className="contact_office-text">09123124709</p>
                    </div>
                  </div>

                  <div className="contact_office-item">
                    <FaEnvelope size={20} />
                    <div>
                      <p className="contact_office-label">Email</p>
                      <p className="contact_office-text">
                        fashiontallyy@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="contact_office-visit">
                    <div className="contact_office-visit-content">
                      <FaCalendarAlt size={20} />
                      <div>
                        <p className="contact_office-visit-title">
                          Schedule a Visit
                        </p>
                        <p className="contact_office-visit-text">
                          Want to see FashionTally in action? Book a
                          personalized demo at our office.
                        </p>
                        <button className="contact_office-visit-button">
                          <FaCalendarAlt size={16} />
                          Book Office Visit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="contact_faq-card">
                <div className="contact_faq-header">
                  <h3 className="contact_faq-title">
                    <FaComments size={20} />
                    Frequently Asked Questions
                  </h3>
                  <p className="contact_faq-description">
                    Find quick answers to common questions about FashionTally
                  </p>
                </div>
                <div className="contact_faq-content">
                  {/* Category Filter */}
                  <div className="contact_faq-categories">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`contact_faq-category ${
                          selectedCategory === category ? "active" : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* FAQ Items */}
                  <div className="contact_faq-items">
                    {filteredFaqs.map((faq, index) => (
                      <div key={index} className="contact_faq-item">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="contact_faq-question"
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === index ? (
                            <FaChevronUp size={16} />
                          ) : (
                            <FaChevronDown size={16} />
                          )}
                        </button>
                        {expandedFaq === index && (
                          <div className="contact_faq-answer">
                            <p>{faq.answer}</p>
                            <span className="contact_faq-category-badge">
                              {faq.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="contact_faq-footer">
                    <p>Can't find what you're looking for?</p>
                    <button className="contact_faq-ask-button">
                      <FaComments size={16} />
                      Ask a Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact_cta-section">
        <div className="contact_cta-container">
          <h2 className="contact_cta-title">
            Ready to Transform Your Fashion Business?
          </h2>
          <p className="contact_cta-subtitle">
            Join hundreds of fashion designers and brands who are already
            growing their business with FashionTally.
          </p>
          <div className="contact_cta-buttons">
            <button
              className="contact_btn-cta-primary"
              onClick={() => navigate("/signup")}
            >
              Start Your Free Trial<span className="contact_btn-arrow">→</span>
            </button>
            <button className="contact_btn-cta-outline">Schedule Demo</button>
          </div>
          <p className="contact_cta-note">
            No credit card required • 7 days free trial • Cancel anytime
          </p>
        </div>
      </section>

      <footer className="contact_footer">
        <div className="contact_footer-container">
          <div className="contact_footer-grid">
            <div className="contact_footer-brand">
              <div className="contact_footer-logo">
                <img src={second} alt="logo" className="contact_logo-image" />
                <span className="contact_logo-textt">FashionTally</span>
              </div>
              <p className="contact_footer-description">
                The complete business management platform for fashion designers
                and brands.
              </p>
              <div className="contact_social-links">
                <div className="contact_social-icon">f</div>
                <div className="contact_social-icon">t</div>
                <div className="contact_social-icon">in</div>
              </div>
            </div>
            <div className="contact_footer-column">
              <h3 className="contact_footer-heading">Product</h3>
              <ul className="contact_footer-links">
                <li>
                  <a href="/#featurees">Features</a>
                </li>
                <li>
                  <a href="/#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div className="contact_footer-column">
              <h3 className="contact_footer-heading">Company</h3>
              <ul className="contact_footer-links">
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="contact_footer-column">
              <h3 className="contact_footer-heading">Support</h3>
              <ul className="contact_footer-links">
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="contact_footer-column">
              <h3 className="contact_footer-heading">Contact Info</h3>
              <div className="contact_contact-info">
                <div className="contact_contact-item">
                  <span>+234 912 312 4709</span>
                </div>
                <div className="contact_contact-item">
                  <span>+1 (332) 322-4202</span>
                </div>
                <div className="contact_contact-item">
                  <span>info@fashiontally.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="contact_footer-bottom">
            <p className="contact_copyright">
              © 2025 FashionTally. All rights reserved.
            </p>
            <p className="contact_powered_by">
              Product of <span style={{ color: "#c9a227", fontWeight: 600 }}>TALLY</span> AFRICA LTD
            </p>
            <div className="contact_footer-legal">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/cookie-policy">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
