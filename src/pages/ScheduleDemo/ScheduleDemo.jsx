import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import toast from "react-hot-toast";
import Button from "../../components/button/Button";
import Input from "../../components/Input";
import "./ScheduleDemo.css";

const ScheduleDemo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessType: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        "fullName",
        "email",
        "phoneNumber",
        "businessName",
        "preferredDate",
        "preferredTime",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        toast.error("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      // Save to Firebase
      const demoRequestData = {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "demo_requests"), demoRequestData);

      toast.success(
        "Demo Scheduled Successfully! We'll contact you soon to confirm your demo appointment."
      );

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        businessName: "",
        businessType: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });

      // Redirect to home after a delay
      setTimeout(() => {
        navigate("/?demo=scheduled");
      }, 2000);
    } catch (error) {
      console.error("Error scheduling demo:", error);
      toast.error("Failed to schedule demo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="schedule-demo-page">
      <div className="schedule-demo-container">
        {/* Header */}
        <div className="schedule-demo-header">
          <button
            onClick={() => navigate("/")}
            className="schedule-demo-back-btn"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <div className="schedule-demo-title-section">
            <div className="schedule-demo-title-wrapper">
              <Calendar size={32} className="schedule-demo-icon" />
              <h1 className="schedule-demo-title">Schedule a Demo</h1>
            </div>
            <p className="schedule-demo-subtitle">
              Book a personalized demo of Fashion Tally and see how it can
              transform your fashion business.
            </p>
          </div>
        </div>

        {/* Demo Form */}
        <div className="schedule-demo-card">
          <div className="schedule-demo-card-header">
            <h2 className="schedule-demo-card-title">
              Let's Schedule Your Demo
            </h2>
            <p className="schedule-demo-card-subtitle">
              Fill out the form below and we'll get back to you within 24 hours
              to confirm your demo.
            </p>
          </div>

          <div className="schedule-demo-card-content">
            <form onSubmit={handleSubmit} className="schedule-demo-form">
              {/* Personal Information */}
              <div className="schedule-demo-section">
                <h3 className="schedule-demo-section-title">
                  <User size={20} />
                  Personal Information
                </h3>

                <div className="schedule-demo-grid">
                  <div className="schedule-demo-field">
                    <label htmlFor="fullName">Full Name *</label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="schedule-demo-field">
                    <label htmlFor="email">Email Address *</label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="schedule-demo-field">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="+234 xxx xxx xxxx"
                    required
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="schedule-demo-section">
                <h3 className="schedule-demo-section-title">
                  <Building size={20} />
                  Business Information
                </h3>

                <div className="schedule-demo-field">
                  <label htmlFor="businessName">Business/Brand Name *</label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    placeholder="Your fashion business name"
                    required
                  />
                </div>

                <div className="schedule-demo-field">
                  <label htmlFor="businessType">Business Type</label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                    className="schedule-demo-select"
                  >
                    <option value="">Select your business type</option>
                    <option value="fashion-designer">Fashion Designer</option>
                    <option value="tailor">Tailor/Seamstress</option>
                    <option value="fashion-retailer">Fashion Retailer</option>
                    <option value="fashion-brand">Fashion Brand</option>
                    <option value="boutique">Boutique Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Scheduling Preferences */}
              <div className="schedule-demo-section">
                <h3 className="schedule-demo-section-title">
                  <Clock size={20} />
                  Preferred Demo Time
                </h3>

                <div className="schedule-demo-grid">
                  <div className="schedule-demo-field">
                    <label htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) =>
                        handleInputChange("preferredDate", e.target.value)
                      }
                      min={minDate}
                      required
                      className="schedule-demo-date-input"
                    />
                  </div>

                  <div className="schedule-demo-field">
                    <label htmlFor="preferredTime">Preferred Time *</label>
                    <select
                      id="preferredTime"
                      value={formData.preferredTime}
                      onChange={(e) =>
                        handleInputChange("preferredTime", e.target.value)
                      }
                      required
                      className="schedule-demo-select"
                    >
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div className="schedule-demo-section">
                <h3 className="schedule-demo-section-title">
                  <MessageSquare size={20} />
                  Additional Information
                </h3>

                <div className="schedule-demo-field">
                  <label htmlFor="message">Message (Optional)</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us about your specific needs or questions about Fashion Tally..."
                    rows={4}
                    className="schedule-demo-textarea"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="schedule-demo-submit">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Scheduling Demo..." : "Schedule My Demo"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="schedule-demo-footer">
          <p className="schedule-demo-footer-text">
            Our demo sessions typically last 30-45 minutes and cover all key
            features of Fashion Tally.
          </p>
          <div className="schedule-demo-footer-buttons">
            <button
              onClick={() => navigate("/contact")}
              className="schedule-demo-footer-btn"
            >
              Have Questions?
            </button>
            <button
              onClick={() => navigate("/")}
              className="schedule-demo-footer-btn-ghost"
            >
              Back to Home
            </button>
          </div>
          <p className="schedule-demo-powered-by">
            Product of <span style={{ color: "#c9a227", fontWeight: 600 }}>TALLY</span> AFRICA LTD
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDemo;
