import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import Button from "../button/Button";
import "./SortByButton.css";

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
        Sort by
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
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortByButton;
