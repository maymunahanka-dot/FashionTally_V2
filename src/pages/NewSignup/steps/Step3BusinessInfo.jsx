import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";
import SearchableSelect from "../../../components/SearchableSelect";

// Business categories
const businessCategories = [
  "Fashion Design",
  "Tailoring",
  "Clothing Store",
  "Boutique",
  "Fashion Accessories",
  "Textile Business",
  "Custom Clothing",
  "Fashion Consulting",
  "Other",
];

// All African countries
const africanCountries = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Côte d'Ivoire",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "São Tomé and Príncipe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
];

const Step3BusinessInfo = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onSubmit,
  onBack,
}) => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const fileInputRef = useRef(null);

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business/Store name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // If "Other" is selected, validate custom category
    if (showCustomCategory && !customCategory.trim()) {
      newErrors.category = "Please specify your category";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "Other") {
      setShowCustomCategory(true);
      // Don't set category yet, wait for custom input
      onInputChange("category", "");
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
      onInputChange("category", selectedValue);
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    // Update the actual category field with custom value
    onInputChange("category", value);
  };

  const handleSubmit = async () => {
    if (validateStep3()) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogoChange = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      // Preview locally — backend will upload to Cloudinary
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      onInputChange("logoFile", file);
    } else if (file) {
      alert("Please select a valid image file (PNG, JPG, GIF)");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoChange(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    onInputChange("logoFile", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const isFormValid = !!(
    formData.businessName &&
    formData.category &&
    formData.country
  );  return (
    <>
      <div className="n_s_u_s-s-header">
        <div className="n_s_u_s-s-header-l-s">
          <button className="n_s_u_s-s-back-btn" onClick={onBack} type="button">
            <svg
              className="n_s_u_s-s-back-icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M19 12H5m7-7l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="n_s_u_s-s-title-con">
        <h1 className="n_s_u_s-s-title">Business Information</h1>
        <p className="n_s_u_s-s-subtitle">Tell us about your business</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Business Name/Store Name */}
        <Input
          type="text"
          label="Business/Store Name"
          value={formData.businessName}
          onChange={(e) => onInputChange("businessName", e.target.value)}
          placeholder="Enter your business or store name"
          required
          error={errors.businessName}
          active={!!formData.businessName}
          variant="rounded"
        />

        {/* Category Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-primary)",
              fontWeight: "500",
            }}
          >
            Category
          </label>
          <select
            value={showCustomCategory ? "Other" : formData.category}
            onChange={handleCategoryChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid var(--border-primary)",
              borderRadius: "4px",
              fontSize: "1rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select Category</option>
            {businessCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && !showCustomCategory && (
            <div className="n_s_u_error-message">{errors.category}</div>
          )}
        </div>

        {/* Custom Category Input - Shows when "Other" is selected */}
        {showCustomCategory && (
          <Input
            type="text"
            label="Specify Your Category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder="Enter your business category"
            required
            error={errors.category}
            active={!!customCategory}
            variant="rounded"
          />
        )}

        {/* Country Selection */}
        <SearchableSelect
          label="Country"
          options={africanCountries}
          value={formData.country}
          onChange={(value) => onInputChange("country", value)}
          placeholder="Search and select your country"
          error={errors.country}
        />

        {/* Logo Upload - Drag and Drop */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-primary)",
              fontWeight: "500",
            }}
          >
            Logo (Optional)
          </label>

          <div
            className={`n_s_u_logo-upload-area ${
              dragActive ? "drag-active" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: "none" }}
            />

            {logoPreview ? (
              <div className="n_s_u_logo-preview-container">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="n_s_u_logo-preview"
                />
                <div className="n_s_u_logo-preview-overlay">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                      className="n_s_u_logo-remove-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <p className="n_s_u_logo-change-text">Click to change</p>
                  </div>
              </div>
            ) : (
              <div className="n_s_u_logo-upload-content">
                <div className="n_s_u_upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="n_s_u_upload-text">
                  <p className="n_s_u_upload-main-text">
                    Drop your logo here, or{" "}
                    <span className="n_s_u_upload-link">browse</span>
                  </p>
                  <p className="n_s_u_upload-sub-text">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="n_s_u_s-s-submitbutton">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isFormValid || isSubmitting}
            className={isFormValid && !isSubmitting ? "" : "n_s_u_s-s-btn-inactive"}
          >
            {isSubmitting ? "Creating Account..." : "Complete Signup"}
          </Button>
        </div>

        <p className="n_s_u_s-s-term">
          By signing up, you agree to the{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/terms-of-service")}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/privacy-policy")}
          >
            Data Processing Agreement
          </span>
        </p>

        <p className="n_s_u_s-s-already-have-account">
          Already have an account?{" "}
          <span
            className="n_s_u_s-s-link"
            onClick={() => (window.location.href = "/login")}
          >
            Sign in
          </span>
        </p>
      </form>
    </>
  );
};

export default Step3BusinessInfo;
