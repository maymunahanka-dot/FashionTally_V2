import { useState, useRef, useEffect } from "react";
import "./SearchableSelect.css";

import { useTranslation } from "react-i18next";
import { tl } from "../../i18n";

/**
 * Type-to-search dropdown.
 *
 * `options` are either strings (countries, categories: shown translated) or
 * `{ value, label, hint? }` objects (e.g. clients: shown as written, `hint` in grey).
 * `onChange` gets the string, or the object's `value`.
 * `loading` shows a spinner beside the arrow while options are being fetched.
 * `clearable` adds a × to go back to no selection.
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  loading = false,
  loadingText,
  emptyText,
  clearable = false,
}) => {
  const { t: tx } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const items = options.map((o) =>
    typeof o === "string"
      ? { value: o, label: tl(o), search: `${o} ${tl(o)}` }
      : { value: o.value, label: o.label, hint: o.hint, search: `${o.label} ${o.hint || ""} ${o.search || ""}` }
  );
  const selected = items.find((i) => i.value === value);

  const filteredOptions = items.filter((i) => i.search.toLowerCase().includes(searchTerm.toLowerCase().trim()));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep the highlighted option in view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      listRef.current.children[highlightedIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (item) => {
    onChange(item.value);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) handleSelect(filteredOptions[highlightedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const shownValue = selected ? selected.label : value || "";
  const showClear = clearable && Boolean(value) && !loading;

  return (
    <div className="searchable-select-container" ref={containerRef}>
      {label && <label className="searchable-select-label">{tl(label)}</label>}
      <div
        className={`searchable-select-input-wrapper ${isOpen ? "searchable-select-open" : ""} ${
          error ? "searchable-select-error" : ""
        } ${showClear ? "has-clear" : ""} ${loading ? "is-loading" : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          className={`searchable-select-input ${shownValue ? "has-value" : ""}`}
          placeholder={shownValue || placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-busy={loading}
        />

        <div className="searchable-select-icons">
          {loading && (
            <span className="searchable-select-spinner" role="status" aria-label={loadingText || tl("Loading...")} />
          )}
          {showClear && (
            <button
              type="button"
              className="searchable-select-clear"
              onClick={() => {
                onChange("");
                setSearchTerm("");
                inputRef.current?.focus();
              }}
              aria-label="Clear"
            >
              ×
            </button>
          )}
          <div
            className="searchable-select-arrow"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={isOpen ? "searchable-select-arrow-up" : ""}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown" ref={listRef}>
          {loading && !items.length ? (
            <div className="searchable-select-no-results searchable-select-loading-row">
              <span className="searchable-select-spinner" aria-hidden="true" />
              {loadingText || tl("Loading...")}
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((item, index) => (
              <div
                key={`${item.value}-${index}`}
                className={`searchable-select-option ${item.value === value ? "searchable-select-option-selected" : ""} ${
                  index === highlightedIndex ? "searchable-select-option-highlighted" : ""
                }`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="searchable-select-option-label">{item.label}</span>
                {item.hint && <span className="searchable-select-option-hint">{item.hint}</span>}
              </div>
            ))
          ) : (
            <div className="searchable-select-no-results">
              {!items.length && emptyText ? emptyText : tx("auto.noResultsFound_658e")}
            </div>
          )}
        </div>
      )}

      {error && <div className="searchable-select-error-message">{tl(error)}</div>}
    </div>
  );
};

export default SearchableSelect;
