import { useContext, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import "./BlockDaysPanel.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const isWeekendKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
};

const BlockDaysPanel = ({ onClose }) => {
  const { user } = useContext(NewAuthContext);
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [blockWeekends, setBlockWeekends] = useState(false);
  const [dates, setDates] = useState([]);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointment/blocked-days`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBlockWeekends(Boolean(data.data?.blockWeekends));
          setDates(data.data?.dates || []);
        }
      } catch {
        setError("Could not load blocked days.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) load();
  }, [user?.email]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startPad = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = Array.from({ length: startPad }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day);
    return result;
  }, [cursor]);

  const persist = async (nextDates, nextWeekends) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointment/blocked-days`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ blockWeekends: nextWeekends, dates: nextDates }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to save");
  };

  const toggleDate = async (key) => {
    if (blockWeekends && isWeekendKey(key) && !dates.includes(key)) return;
    const next = dates.includes(key)
      ? dates.filter((item) => item !== key)
      : [...dates, key].sort();
    const previous = dates;
    setDates(next);
    setSaving(true);
    setError("");
    try {
      await persist(next, blockWeekends);
    } catch (err) {
      setDates(previous);
      setError(err.message || "Could not update that day.");
    } finally {
      setSaving(false);
    }
  };

  const toggleWeekends = async () => {
    const next = !blockWeekends;
    setBlockWeekends(next);
    setSaving(true);
    setError("");
    try {
      await persist(dates, next);
    } catch (err) {
      setBlockWeekends(!next);
      setError(err.message || "Could not update weekends.");
    } finally {
      setSaving(false);
    }
  };

  const jumpToDate = (value) => {
    setSearch(value);
    if (!value) {
      setHighlight("");
      return;
    }
    const [year, month] = value.split("-").map(Number);
    setCursor(new Date(year, month - 1, 1));
    setHighlight(value);
  };

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="block_days_panel">
      <div className="block_days_header">
        <button type="button" className="block_days_close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Block days</h2>
      </div>

      <div className="block_days_body">
        {loading ? (
          <p className="block_days_note">Loading...</p>
        ) : (
          <>
            <label className="block_days_weekend">
              <input type="checkbox" checked={blockWeekends} onChange={toggleWeekends} />
              <span>
                <strong>Block every weekend</strong>
                <small>Saturday and Sunday cannot be booked</small>
              </span>
            </label>

            <label className="block_days_search">
              Find a day
              <input
                type="date"
                value={search}
                onChange={(e) => jumpToDate(e.target.value)}
              />
            </label>

            <div className="block_days_month">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <strong>{monthLabel}</strong>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="block_days_grid block_days_weekdays">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="block_days_grid">
              {cells.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;
                const key = toKey(cursor.getFullYear(), cursor.getMonth(), day);
                const blocked = dates.includes(key) || (blockWeekends && isWeekendKey(key));
                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      "block_days_cell",
                      blocked ? "is_blocked" : "",
                      key === todayKey ? "is_today" : "",
                      key === highlight ? "is_found" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => toggleDate(key)}
                    disabled={saving}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <p className="block_days_note">
              {saving ? "Saving..." : "Click a day to block it. Click again to open it."}
            </p>
            {error && <p className="block_days_error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default BlockDaysPanel;
