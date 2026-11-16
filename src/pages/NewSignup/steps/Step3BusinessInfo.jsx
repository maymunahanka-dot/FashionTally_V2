import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";
import SearchableSelect from "../../../components/SearchableSelect";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";


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

// Countries offered at sign-up (same as the mobile app, plus all of Africa).
// The backend sets the account's display currency from this.
const africanCountries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Angola",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Benin",
  "Bolivia",
  "Botswana",
  "Brazil",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Côte d'Ivoire",
  "DR Congo",
  "Denmark",
  "Djibouti",
  "Ecuador",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Germany",
  "Ghana",
  "Greece",
  "Guinea",
  "Guinea-Bissau",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Netherlands",
  "New Zealand",
  "Niger",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sudan",
  "Sweden",
  "Switzerland",
  "São Tomé and Príncipe",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Venezuela",
  "Vietnam",
  "Yemen",
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
  const { t: tx } = useTranslation();
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
      newErrors.businessName = tx("auto.businessStoreNameIsRequired_0902");
    }

    if (!formData.category) {
      newErrors.category = tx("auto.categoryIsRequired_eb1a");
    }

    // If "Other" is selected, validate custom category
    if (showCustomCategory && !customCategory.trim()) {
      newErrors.category = tx("auto.pleaseSpecifyYourCategory_a455");
    }

    if (!formData.country) {
      newErrors.country = tx("auto.countryIsRequired_66a0");
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
        alert(tx("auto.fileSizeMustBeLess_1964"));
        return;
      }

      // Preview locally — backend will upload to Cloudinary
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      onInputChange("logoFile", file);
    } else if (file) {
      alert(tx("auto.pleaseSelectAValidImage_3c54"));
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
        <h1 className="n_s_u_s-s-title">{tx("auto.businessInformation_a10a")}</h1>
        <p className="n_s_u_s-s-subtitle">{tx("auto.tellUsAboutYourBusiness_7b13")}</p>
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
          label={tx("auto.businessStoreName_5f92")}
          value={formData.businessName}
          onChange={(e) => onInputChange("businessName", e.target.value)}
          placeholder={tx("auto.enterYourBusinessOrStore_170b")}
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
            {tx("auto.category_a3c6")}
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
            <option value="">{tx("auto.selectCategory_4d18")}</option>
            {businessCategories.map((category) => (
              <option key={category} value={category}>
                {tl(category)}
              </option>
            ))}
          </select>
          {errors.category && !showCustomCategory && (
            <div className="n_s_u_error-message">{tl(errors.category)}</div>
          )}
        </div>

        {/* Custom Category Input - Shows when "Other" is selected */}
        {showCustomCategory && (
          <Input
            type="text"
            label={tx("auto.specifyYourCategory_ed90")}
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder={tx("auto.enterYourBusinessCategory_e13f")}
            required
            error={errors.category}
            active={!!customCategory}
            variant="rounded"
          />
        )}

        {/* Country Selection */}
        <SearchableSelect
          label={tx("auto.country_d523")}
          options={africanCountries}
          value={formData.country}
          onChange={(value) => onInputChange("country", value)}
          placeholder={tx("auto.searchAndSelectYourCountry_a38d")}
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
            {tx("auto.logoOptional_edfb")}
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
                    <p className="n_s_u_logo-change-text">{tx("auto.clickToChange_31d9")}</p>
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
                    {tx("auto.dropYourLogoHereOr_55b3")}{" "}
                    <span className="n_s_u_upload-link">{tx("auto.browse_0f6a")}</span>
                  </p>
                  <p className="n_s_u_upload-sub-text">
                    {tx("auto.pngJpgGifUpTo_5077")}
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
            {tl(isSubmitting ? tx("auto.creatingAccount_2b62") : tx("auto.completeSignup_4e23"))}
          </Button>
        </div>

        <p className="n_s_u_s-s-term">
          {tx("auto.bySigningUpYouAgree_d580")}{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/terms-of-service")}
          >
            {tx("auto.termsOfService_0c8a")}
          </span>{" "}
          {tx("auto.and_cffa")}{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/privacy-policy")}
          >
            {tx("auto.dataProcessingAgreement_a061")}
          </span>
        </p>

        <p className="n_s_u_s-s-already-have-account">
          {tx("auto.alreadyHaveAnAccount_8559")}{" "}
          <span
            className="n_s_u_s-s-link"
            onClick={() => (window.location.href = "/login")}
          >
            {tx("auto.signIn_ada2")}
          </span>
        </p>
      </form>
    </>
  );
};

export default Step3BusinessInfo;
