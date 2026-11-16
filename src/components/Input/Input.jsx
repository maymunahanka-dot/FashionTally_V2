import { useState, useRef, useEffect } from "react";
import "./Input.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


const Input = ({
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  active = false,
  error = "",
  options = [], // for select
  accept = "image/*", // for file input
  maxNumber = null, // for number input
  checked = false, // for checkbox/switch
  className = "",
  showPasswordToggle = true, // New prop to control password toggle
  variant = "bottom", // New prop: "rounded" or "bottom"
  ...props
}) => {
  const { t: tx } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const currentFileRef = useRef(null);

  // Handle image preview URL creation and cleanup - only for image inputs
  useEffect(() => {
    if (type !== "image") return;

    console.log("Image useEffect triggered:", {
      value,
      type: typeof value,
      isFile: value instanceof File,
    });

    if (value instanceof File && value !== currentFileRef.current) {
      console.log("Creating new object URL for file:", value.name);
      // Clean up previous URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      // Create new URL
      const newUrl = URL.createObjectURL(value);
      console.log("Created object URL:", newUrl);
      setImagePreviewUrl(newUrl);
      currentFileRef.current = value;
    } else if (!value && imagePreviewUrl) {
      console.log("Cleaning up image preview URL");
      // Clean up when no file is selected
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      currentFileRef.current = null;
    } else if (
      value &&
      typeof value === "string" &&
      value.startsWith("file:///")
    ) {
      // Handle the case where someone passes a file path string (which won't work)
      console.warn(
        "File path string detected, this won't work for security reasons:",
        value
      );
      setImagePreviewUrl(null);
    }
  }, [value, type, imagePreviewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        console.log("Cleaning up on unmount:", imagePreviewUrl);
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Determine the actual input type (for password toggle)
  const getInputType = () => {
    if (type === "password" && showPassword) {
      return "text";
    }
    return type;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && onChange) {
      onChange({ target: { files } });
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleNumberChange = (e) => {
    const numValue = parseFloat(e.target.value);
    if (maxNumber && numValue > maxNumber) {
      e.target.value = maxNumber;
    }
    onChange(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderPasswordToggle = () => {
    if (type !== "password" || !showPasswordToggle) return null;

    return (
      <button
        type="button"
        className="_in_com_password_toggle"
        onClick={togglePasswordVisibility}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          // Eye slash icon (hide password)
          <svg
            className="_in_com_password_icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="2"
              y1="2"
              x2="22"
              y2="22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Eye icon (show password)
          <svg
            className="_in_com_password_icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  };

  const renderInput = () => {
    switch (type) {
      case "text":
      case "email":
      case "password":
        return (
          <div className="_in_com_input_field_container">
            <input
              type={getInputType()}
              value={value || ""}
              onChange={onChange}
              placeholder={tl(placeholder)}
              required={required}
              disabled={disabled}
              className={`_in_com_input_field _in_com_input_field_${variant} ${
                error ? "error" : ""
              } ${active ? "active" : ""} ${
                type === "password" ? "password-input" : ""
              }`}
              {...props}
            />
            {tl(renderPasswordToggle())}
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={handleNumberChange}
            placeholder={tl(placeholder)}
            required={required}
            disabled={disabled}
            max={maxNumber}
            className={`_in_com_input_field _in_com_input_field_${variant} ${
              error ? "error" : ""
            } ${active ? "active" : ""}`}
            {...props}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={tl(placeholder)}
            required={required}
            disabled={disabled}
            className={`_in_com_input_field _in_com_input_field_${variant} _in_com_textarea ${
              error ? "error" : ""
            } ${active ? "active" : ""}`}
            {...props}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`_in_com_input_field _in_com_input_field_${variant} _in_com_select ${
              error ? "error" : ""
            } ${active ? "active" : ""}`}
            {...props}
          >
            <option value="">{tl(placeholder || tx("auto.selectAnOption_08d7"))}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {tl(option.label || option)}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="_in_com_checkbox_container">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              required={required}
              disabled={disabled}
              className="_in_com_checkbox_input"
              {...props}
            />
            <span
              className={`_in_com_checkbox_custom ${error ? "error" : ""} ${
                active ? "active" : ""
              }`}
            >
              <svg className="_in_com_checkbox_icon" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </span>
            {label && <span className="_in_com_checkbox_label">{tl(label)}</span>}
          </label>
        );

      case "switch":
        return (
          <label className="_in_com_switch_container">
            {label && <span className="_in_com_switch_label">{tl(label)}</span>}
            <div
              className={`_in_com_switch ${error ? "error" : ""} ${
                active ? "active" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="_in_com_switch_input"
                {...props}
              />
              <span className="_in_com_switch_slider"></span>
            </div>
          </label>
        );

      case "date":
      case "datetime-local":
      case "time":
        return (
          <div className="_in_com_input_field_container">
            <input
              type={type}
              value={value}
              onChange={onChange}
              required={required}
              disabled={disabled}
              className={`_in_com_input_field _in_com_input_field_${variant} _in_com_calendar ${
                error ? "error" : ""
              } ${active ? "active" : ""}`}
              {...props}
            />
          </div>
        );

      case "image":
        return (
          <div className="_in_com_image_input_container">
            <div
              className={`_in_com_image_drop_zone _in_com_image_drop_zone_${variant} ${
                isDragOver ? "drag-over" : ""
              } ${error ? "error" : ""} ${active ? "active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={onChange}
                className="_in_com_hidden_file_input"
                {...props}
              />
              <div className="_in_com_drop_zone_content">
                {(() => {
                  console.log("Rendering image input:", {
                    imagePreviewUrl,
                    value,
                    valueType: typeof value,
                    isFile: value instanceof File,
                  });

                  if (imagePreviewUrl) {
                    console.log("Showing imagePreviewUrl:", imagePreviewUrl);
                    return (
                      <div className="_in_com_image_preview">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="_in_com_preview_image"
                          onError={(e) => {
                            console.error(
                              "Image preview error:",
                              e,
                              "URL:",
                              imagePreviewUrl
                            );
                            // Hide the broken image and show placeholder
                            e.target.style.display = "none";
                          }}
                          onLoad={() =>
                            console.log("Image loaded successfully")
                          }
                        />
                        <div className="_in_com_image_overlay">
                          <p>{tx("auto.clickToChangeImage_b52b")}</p>
                        </div>
                      </div>
                    );
                  } else if (
                    value &&
                    typeof value === "string" &&
                    !value.startsWith("file:///")
                  ) {
                    console.log("Showing string URL:", value);
                    return (
                      <div className="_in_com_image_preview">
                        <img
                          src={value}
                          alt="Preview"
                          className="_in_com_preview_image"
                          onError={(e) => {
                            console.error("Image preview error:", e);
                            e.target.style.display = "none";
                          }}
                          onLoad={() =>
                            console.log("String image loaded successfully")
                          }
                        />
                        <div className="_in_com_image_overlay">
                          <p>{tx("auto.clickToChangeImage_b52b")}</p>
                        </div>
                      </div>
                    );
                  } else {
                    console.log("Showing placeholder");
                    return (
                      <>
                        <svg
                          className="_in_com_upload_icon"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <p>{tl(placeholder || tx("auto.clickToSelectImages_73f3"))}</p>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={tl(placeholder)}
            required={required}
            disabled={disabled}
            className={`_in_com_input_field ${error ? "error" : ""} ${
              active ? "active" : ""
            }`}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`_in_com_input_wrapper ${className}`}>
      {label && type !== "checkbox" && type !== "switch" && (
        <label className="_in_com_input_label">
          {tl(label)}
          {/* {required && <span className="_in_com_required">*</span>} */}
        </label>
      )}
      {tl(renderInput())}
      {error && <span className="_in_com_error_message">{tl(error)}</span>}
    </div>
  );
};

export default Input;
