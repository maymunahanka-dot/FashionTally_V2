import { useTheme } from "../../contexts/ThemeContext";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  loading = false,
  active = false,
  fullWidth = false,
  icon = null,
  iconPosition = "left",
  className = "",
  ...props
}) => {
  const { actualTheme } = useTheme();

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  const buttonClasses = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    active && "btn-active",
    loading && "btn-loading",
    disabled && "btn-disabled",
    fullWidth && "btn-full-width",
    icon && "btn-with-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "string") {
      // If icon is a string, render as SVG path or use predefined icons
      const predefinedIcons = {
        loading: (
          <svg className="btn-icon btn-spinner" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        ),
        arrow: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M5 12h14m-7-7l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        check: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        plus: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        download: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5-7v12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        upload: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5-5m-5 1v12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        edit: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        delete: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <path
              d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        search: (
          <svg className="btn-icon" viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="m21 21-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };

      return predefinedIcons[icon] || null;
    }

    // If icon is a React component/element
    return <span className="btn-icon">{icon}</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          {renderIcon() || (
            <svg className="btn-icon btn-spinner" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              >
                <animate
                  attributeName="stroke-dasharray"
                  dur="2s"
                  values="0 31.416;15.708 15.708;0 31.416"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  dur="2s"
                  values="0;-15.708;-31.416"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          )}
          <span className="btn-text">Loading...</span>
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === "left" && renderIcon()}
        <span className="btn-text">{children}</span>
        {icon && iconPosition === "right" && renderIcon()}
      </>
    );
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      data-theme={actualTheme}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
