import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import Button from "../button/Button";
import "./SortByButton.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";
export function useSavedSort(storageKey, fallback = "newest") {
  const [sortBy, setSortBy] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || fallback;
    } catch {
      return fallback;
    }
  });

  const updateSort = (value) => {
    setSortBy(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Ignore storage failures (private mode, quota).
    }
  };

  return [sortBy, updateSort];
}

const SortByButton = ({ value, onChange, options, open, onToggle }) => {
  const { t: tx } = useTranslation();
  return (
    <div className="clients-sort">
      <Button
        variant="outline"
        size="medium"
        icon={<ArrowUpDown size={18} />}
        iconPosition="left"
        active={open}
        aria-label="Sort by"
        className="sort-by-btn"
        onClick={onToggle}
      >
        {tx("auto.sortBy_a2a5")}
      </Button>
      {open && (
        <div className="sort-dropdown" role="menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.value}
              className={`sort-option${value === option.value ? " active" : ""}`}
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
            >
              {tl(option.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortByButton;
