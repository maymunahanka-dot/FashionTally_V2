import { useState, useEffect } from "react";
import { ChevronLeft, Upload, Link, Loader2 } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import { currencyOptions } from "../../utils/exchangeRate";
import { clearCurrencyCache } from "../../utils/useDisplayCurrency";

const CURRENCY_OPTIONS = currencyOptions();
const CURRENCY_LABELS = CURRENCY_OPTIONS.map((c) => c.label);
const toCurrencyCode = (value) => (/^[A-Z]{3}$/.test(String(value || "").toUpperCase()) ? String(value).toUpperCase() : "NGN");
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import "./BrandPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";
const API = import.meta.env.VITE_BACKEND_URL;

const BrandPanel = ({ onClose }) => {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();

  const token = () => localStorage.getItem("authToken");

  // Form state
  const [brandName, setBrandName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#666666");
  const [footerText, setFooterText] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [inventoryCurrency, setInventoryCurrency] = useState("NGN");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.email) loadBrandData();
  }, [user]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const res = await fetch(`${API}/api/brand-setting/get-by-email/${effectiveEmail}`);
      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        setBrandName(d.businessName || "");
        setBusinessAddress(d.businessAddress || "");
        setPhoneNumber(d.businessPhone || "");
        setEmail(d.businessEmail || "");
        setWebsite(d.businessWebsite || "");
        setInstagramHandle(d.instagramHandle || "");
        setBankName(d.bankName || "");
        setAccountNumber(d.accountNumber || "");
        setAccountName(d.accountName || "");
        setLogoUrl(d.logoUrl || "");
        setPrimaryColor(d.primaryColor || "#000000");
        setSecondaryColor(d.secondaryColor || "#666666");
        setFooterText(d.footerText || "");
        setTermsAndConditions(d.termsAndConditions || "");
        setInventoryCurrency(toCurrencyCode(d.inventoryCurrency));
      }
    } catch (error) {
      console.error("Error loading brand data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!brandName.trim()) {
      newErrors.brandName = tx("auto.brandNameIsRequired_c0de");
    }

    if (!businessAddress.trim()) {
      newErrors.businessAddress = tx("auto.businessAddressIsRequired_f139");
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = tx("auto.phoneNumberIsRequired_f845");
    }

    if (!email.trim()) {
      newErrors.email = tx("auto.emailAddressIsRequired_e7f0");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = tx("auto.emailAddressIsInvalid_85f8");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadLogoToStorage = async (file) => {
    if (!file || !user) return null;

    try {
      setLogoUploading(true);

      // Upload to Cloudinary using the utility function
      const downloadURL = await uploadToCloudinary(file);

      console.log("Logo uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error(
        error.message || "Failed to upload logo. Please try again."
      );
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);

      let finalLogoUrl = logoUrl;
      if (brandLogo) finalLogoUrl = await uploadLogoToStorage(brandLogo);

      const effectiveEmail = getEffectiveUserEmail(user);
      const brandData = {
        id:                effectiveEmail,
        userEmail:         effectiveEmail,
        businessName:      brandName,
        businessAddress:   businessAddress,
        businessPhone:     phoneNumber,
        businessEmail:     email,
        businessWebsite:   website,
        instagramHandle:   instagramHandle,
        bankName:          bankName,
        accountNumber:     accountNumber,
        accountName:       accountName,
        logoUrl:           finalLogoUrl,
        primaryColor:      primaryColor,
        secondaryColor:    secondaryColor,
        footerText:        footerText,
        termsAndConditions: termsAndConditions,
        inventoryCurrency: toCurrencyCode(inventoryCurrency),
      };

      // Try edit first, fall back to create if not found
      const editRes = await fetch(`${API}/api/brand-setting/edit/${effectiveEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(brandData),
      });
      const editData = await editRes.json();

      if (!editData.success) {
        // Brand doesn't exist yet — create it
        const createRes = await fetch(`${API}/api/brand-setting/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify(brandData),
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error(createData.error || "Failed to save brand settings");
      }

      clearCurrencyCache(); // so money is shown in the new currency straight away
      alert(tx("auto.brandSettingsSavedSuccessfully_f10b"));
      onClose();
    } catch (error) {
      console.error("Error saving brand settings:", error);
      alert(tx("auto.failedToSaveBrandSettings_a3aa"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(tx("auto.logoFileMustBeLess_9c61"));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(tx("auto.pleaseSelectAnImageFile_b1d1"));
        return;
      }

      setBrandLogo(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);
    }
  };

  const getBrandInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="brand_panel">
        <div className="brand_header">
          <button className="brand_back_btn" onClick={onClose}>
            <ChevronLeft size={20} />
            {tx("auto.brand_62b4")}
          </button>
        </div>
        <div className="brand_loading">
          <Loader2 className="animate-spin" size={24} />
          <p>{tx("auto.loadingBrandSettings_fb73")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand_panel">
      {/* Header */}
      <div className="brand_header">
        <button className="brand_back_btn" onClick={onClose}>
          <ChevronLeft size={20} />
          {tx("auto.brand_62b4")}
        </button>
      </div>

      {/* Subtitle */}
      <div className="brand_subtitle">
        <p>{tx("auto.manageYourBusinessDetails_3c5f")}</p>
      </div>

      {/* Form */}
      <form className="brand_form" onSubmit={handleSubmit}>
        {/* Brand Logo Section */}
        <div className="brand_logo_section">
          <label className="brand_section_label">{tx("auto.brandLogo_25dd")}</label>
          <div className="brand_logo_container">
            <div className="brand_logo_display">
              {logoUrl || brandLogo ? (
                <img
                  src={brandLogo ? URL.createObjectURL(brandLogo) : logoUrl}
                  alt="Brand Logo"
                  className="brand_logo_image"
                />
              ) : (
                <span className="brand_logo_initials">
                  {tl(getBrandInitials(brandName))}
                </span>
              )}
            </div>
            <button
              type="button"
              className="brand_upload_btn"
              onClick={() =>
                document.getElementById("brand-logo-input").click()
              }
              disabled={logoUploading}
            >
              {logoUploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {tx("auto.uploading_070e")}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {tx("auto.uploadLogo_8a04")}
                </>
              )}
            </button>
            <input
              id="brand-logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="brand_logo_input"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.brandName_45fb")}
            type="text"
            placeholder={tx("auto.mSDesign_4759")}
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              clearError("brandName");
            }}
            error={errors.brandName}
            required
            variant="rounded"
          />
        </div>

        {/* Business Address */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.businessAddress_6a24")}
            type="textarea"
            placeholder={tx("auto.12FashionStreetVictoriaIsland_f97b")}
            value={businessAddress}
            onChange={(e) => {
              setBusinessAddress(e.target.value);
              clearError("businessAddress");
            }}
            error={errors.businessAddress}
            required
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Phone Number */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.phoneNumber_ab25")}
            type="number"
            placeholder="+234 803 456 7890"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              clearError("phoneNumber");
            }}
            error={errors.phoneNumber}
            required
            variant="rounded"
          />
        </div>

        {/* Email */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.email_84ad")}
            type="email"
            placeholder="hello@fashiontalfy.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            error={errors.email}
            required
            variant="rounded"
          />
        </div>

        {/* Website */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.website_2e8a")}
            type="text"
            placeholder="www.M&S.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Instagram Handle */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.instagramHandle_9925")}
            type="text"
            placeholder="@fashiontalfy"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Brand Colors Section */}
        <div className="brand_colors_section">
          <label className="brand_section_label">{tx("auto.brandColors_d071")}</label>
          <div className="brand_colors_container">
            <div className="brand_form_group">
              <label className="brand_color_label">{tx("auto.primaryColor_d3dc")}</label>
              <div className="brand_color_input_container">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="brand_color_picker"
                />
                <Input
                  type="text"
                  placeholder="#000000"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  variant="rounded"
                />
              </div>
            </div>
            <div className="brand_form_group">
              <label className="brand_color_label">{tx("auto.secondaryColor_7a87")}</label>
              <div className="brand_color_input_container">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="brand_color_picker"
                />
                <Input
                  type="text"
                  placeholder="#666666"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  variant="rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.invoiceFooterText_ea73")}
            type="textarea"
            placeholder={tx("auto.thankYouForYourBusiness_80f9")}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="brand_form_group">
          <Input
            label={tx("auto.termsAndConditions_8940")}
            type="textarea"
            placeholder={tx("auto.enterYourTermsAndConditions_88e6")}
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            variant="rounded"
            rows={4}
          />
        </div>

        <div className="brand_form_group">
          {/* Type to search, e.g. "yuan", "CNY" or "£" */}
          <SearchableSelect
            label={tx("auto.currency_e070")}
            options={CURRENCY_LABELS}
            value={CURRENCY_OPTIONS.find((c) => c.code === inventoryCurrency)?.label || ""}
            onChange={(label) => {
              const picked = CURRENCY_OPTIONS.find((c) => c.label === label);
              if (picked) setInventoryCurrency(picked.code);
            }}
            placeholder={tx("auto.searchCurrencyEGYuan_ff91")}
          />
          <p className="brand_currency_hint">
            {tx("auto.moneyIsShownInThis_220b")}
          </p>
        </div>

        {/* Bank Details Section */}
        <div className="brand_bank_section">
          <div className="brand_bank_header">
            <label className="brand_section_label">{tx("auto.bankDetails_7bc4")}</label>
            <button type="button" className="brand_link_btn">
              <Link size={16} />
            </button>
          </div>

          <div className="brand_form_group">
            <Input
              label={tx("auto.bankName_3126")}
              type="text"
              placeholder={tx("auto.gtbank_169d")}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="brand_form_group">
            <Input
              label={tx("auto.accountNumber_0bd6")}
              type="text"
              placeholder="0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="brand_form_group">
            <Input
              label={tx("auto.accountName_db3b")}
              type="text"
              placeholder={tx("auto.mSDesign_4759")}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              variant="rounded"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="brand_save_btn"
          disabled={saving || logoUploading}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {tx("auto.savingChanges_e636")}
            </>
          ) : (
            tx("auto.saveChanges_fa29")
          )}
        </button>
      </form>
    </div>
  );
};

export default BrandPanel;
