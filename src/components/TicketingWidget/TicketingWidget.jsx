import { useState, useEffect, useCallback } from "react";
import "./TicketingWidget.css";

// ── Categories (kept client-side — no API needed) ─────────────────────────────

const TOP_CATEGORIES = [
  {
    id: "subscription",
    title: "Subscription & Billing",
    description: "Issues with your plan, payments, upgrades, or cancellations.",
    subIssues: [
      { id: "sub-upgrade",  title: "Upgrade / downgrade plan",   hint: "Supporting documents optional" },
      { id: "sub-cancel",   title: "Cancel subscription",        hint: "Supporting documents optional" },
      { id: "sub-payment",  title: "Payment failed",             hint: "Supporting documents optional" },
      { id: "sub-invoice",  title: "Invoice / receipt request",  hint: "Supporting documents optional" },
    ],
  },
  {
    id: "subadmin",
    title: "Sub-Admin & Permissions",
    description: "Issues with sub-admin accounts, roles, and access permissions.",
    subIssues: [
      { id: "sa-create", title: "Cannot create sub-admin",   hint: "Supporting documents optional" },
      { id: "sa-perm",   title: "Permission not working",    hint: "Supporting documents optional" },
      { id: "sa-remove", title: "Remove sub-admin access",   hint: "Supporting documents optional" },
    ],
  },
];

const MAIN_CATEGORIES = [
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    description: "Issues with your dashboard overview, charts, or statistics not loading correctly.",
    subIssues: [
      { id: "dash-load",  title: "Dashboard not loading",  hint: "Supporting documents optional" },
      { id: "dash-stats", title: "Incorrect statistics",   hint: "Supporting documents optional" },
    ],
  },
  {
    id: "clients",
    title: "Client Management",
    description: "Problems adding, editing, or viewing client profiles and records.",
    subIssues: [
      { id: "cl-add",    title: "Cannot add client",        hint: "Supporting documents optional" },
      { id: "cl-edit",   title: "Edit client not saving",   hint: "Supporting documents optional" },
      { id: "cl-delete", title: "Client deletion issue",    hint: "Supporting documents optional" },
    ],
  },
  {
    id: "orders",
    title: "Orders & Invoices",
    description: "Issues with creating, updating, or tracking orders and invoices.",
    subIssues: [
      { id: "ord-create",  title: "Cannot create order",      hint: "Supporting documents optional" },
      { id: "ord-invoice", title: "Invoice not generating",   hint: "Supporting documents optional" },
      { id: "ord-status",  title: "Order status stuck",       hint: "Supporting documents optional" },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Designs",
    description: "Problems with inventory tracking, fabric stock, or design uploads.",
    subIssues: [
      { id: "inv-stock",  title: "Stock not updating",    hint: "Supporting documents optional" },
      { id: "inv-design", title: "Design upload failing", hint: "Supporting documents optional" },
    ],
  },
  {
    id: "appointments",
    title: "Appointments",
    description: "Issues scheduling, editing, or receiving appointment notifications.",
    subIssues: [
      { id: "apt-book",   title: "Cannot book appointment",   hint: "Supporting documents optional" },
      { id: "apt-notify", title: "No notification received",  hint: "Supporting documents optional" },
    ],
  },
  {
    id: "finances",
    title: "Finances & Reports",
    description: "Issues with financial reports, transaction history, or exports.",
    subIssues: [
      { id: "fin-report", title: "Report not generating", hint: "Supporting documents optional" },
      { id: "fin-export", title: "Export failing",        hint: "Supporting documents optional" },
    ],
  },
  {
    id: "crm",
    title: "CRM & Loyalty",
    description: "Problems with CRM campaigns, loyalty points, or rewards.",
    subIssues: [
      { id: "crm-camp",   title: "Campaign not sending",  hint: "Supporting documents optional" },
      { id: "crm-loyalty", title: "Loyalty points issue", hint: "Supporting documents optional" },
    ],
  },
  {
    id: "settings",
    title: "Account & Settings",
    description: "Issues with brand settings, profile, notifications, or integrations.",
    subIssues: [
      { id: "set-brand", title: "Brand settings not saving",   hint: "Supporting documents optional" },
      { id: "set-notif", title: "Notifications not working",   hint: "Supporting documents optional" },
    ],
  },
];

const BOTTOM_CATEGORIES = [
  {
    id: "other",
    title: "Other",
    description: "Any issue that doesn't fit the categories above.",
    subIssues: [
      { id: "oth-general", title: "General question",    hint: "Supporting documents optional" },
      { id: "oth-bug",     title: "Bug report",          hint: "Supporting documents optional" },
      { id: "oth-suggest", title: "Feature suggestion",  hint: "Supporting documents optional" },
    ],
  },
];

// ── API helpers ───────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_BACKEND_URL;

function authHeaders() {
  const token = localStorage.getItem("authToken");
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch(path, options = {}) {
  const res  = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
}

// GET /api/support-ticket/list
async function fetchTickets() {
  return apiFetch("/api/support-ticket/list", { headers: authHeaders() });
}

// GET /api/support-ticket/get/:id
async function fetchTicket(id) {
  return apiFetch(`/api/support-ticket/get/${id}`, { headers: authHeaders() });
}

// POST /api/support-ticket/create  (multipart)
async function createTicket({ category, subIssue, description, dateNoticed, files }) {
  const body = new FormData();
  body.append("category",    category);
  body.append("subIssue",    subIssue);
  body.append("description", description);
  if (dateNoticed) body.append("dateNoticed", dateNoticed);
  if (files) {
    Array.from(files).forEach((f) => body.append("attachments", f));
  }
  return apiFetch("/api/support-ticket/create", {
    method:  "POST",
    headers: authHeaders(),   // no Content-Type — browser sets multipart boundary
    body,
  });
}

// POST /api/support-ticket/get/:id/messages
async function postMessage(id, text) {
  return apiFetch(`/api/support-ticket/get/${id}/messages`, {
    method:  "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body:    JSON.stringify({ text }),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconDoc = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="12" y2="17"/>
  </svg>
);

const IconCheck = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconPaperclip = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────

function Tabs({ active, onChange }) {
  return (
    <div className="tw-tabs">
      <button className={`tw-tab ${active === "new" ? "active" : ""}`} onClick={() => onChange("new")}>New ticket</button>
      <button className={`tw-tab ${active === "my"  ? "active" : ""}`} onClick={() => onChange("my")}>My tickets</button>
    </div>
  );
}

function Header({ title, subtitle, onBack, onClose, showBack }) {
  return (
    <div className="tw-header">
      <div className="tw-header-left">
        {showBack && (
          <button className="tw-icon-btn" onClick={onBack} aria-label="Back"><IconBack /></button>
        )}
        <div>
          <h2 className="tw-header-title">{title}</h2>
          <p className="tw-header-sub">{subtitle}</p>
        </div>
      </div>
      <button className="tw-icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
    </div>
  );
}

// ── VIEW 1 — Category / My Tickets list ──────────────────────────────────────

function ViewCategories({ onSelect, activeTab, onTabChange, tickets, ticketsLoading, onTicketClick, onClose }) {
  return (
    <>
      <Header title="Need help?" subtitle="Choose what you need help with." showBack={false} onClose={onClose} />
      <div className="tw-body">
        <Tabs active={activeTab} onChange={onTabChange} />

        {activeTab === "new" && (
          <ul className="tw-cat-list">
            <li className="tw-cat-section-label">Account &amp; Plan</li>
            {TOP_CATEGORIES.map(c => (
              <li key={c.id}>
                <button className="tw-cat-item" onClick={() => onSelect(c)}>
                  <div className="tw-cat-text">
                    <span className="tw-cat-title">{c.title}</span>
                    <span className="tw-cat-desc">{c.description}</span>
                  </div>
                </button>
              </li>
            ))}
            <li className="tw-cat-section-label">Features</li>
            {MAIN_CATEGORIES.map(c => (
              <li key={c.id}>
                <button className="tw-cat-item" onClick={() => onSelect(c)}>
                  <div className="tw-cat-text">
                    <span className="tw-cat-title">{c.title}</span>
                    <span className="tw-cat-desc">{c.description}</span>
                  </div>
                </button>
              </li>
            ))}
            <li className="tw-cat-section-label">Other</li>
            {BOTTOM_CATEGORIES.map(c => (
              <li key={c.id}>
                <button className="tw-cat-item" onClick={() => onSelect(c)}>
                  <div className="tw-cat-text">
                    <span className="tw-cat-title">{c.title}</span>
                    <span className="tw-cat-desc">{c.description}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "my" && (
          <ul className="tw-ticket-list">
            {ticketsLoading && <li className="tw-empty">Loading tickets…</li>}
            {!ticketsLoading && tickets.length === 0 && <li className="tw-empty">No tickets yet.</li>}
            {!ticketsLoading && tickets.map(t => (
              <li key={t.id}>
                <button className="tw-ticket-card" onClick={() => onTicketClick(t)}>
                  <div className="tw-ticket-card-top">
                    <span className="tw-ticket-id">#{t.id}</span>
                    <span className={`tw-badge ${t.status === "resolved" ? "resolved" : t.status === "in_progress" ? "in-progress" : "open"}`}>
                      {t.status === "resolved" ? "Resolved" : t.status === "in_progress" ? "In Progress" : "Open"}
                    </span>
                  </div>
                  <p className="tw-ticket-sub">{t.subIssue}</p>
                  <p className="tw-ticket-preview">{t.description}</p>
                  <div className="tw-ticket-card-bottom">
                    <span className="tw-ticket-cat">{t.category}</span>
                    <span className="tw-ticket-date">{formatDate(t.createdAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ── VIEW 2 — Sub-issue list ───────────────────────────────────────────────────

function ViewSubIssues({ category, onSelect, onBack, onClose, activeTab, onTabChange }) {
  return (
    <>
      <Header title={category.title} subtitle="Select the issue that best matches your problem." showBack onBack={onBack} onClose={onClose} />
      <div className="tw-body">
        <Tabs active={activeTab} onChange={onTabChange} />
        <ul className="tw-cat-list">
          {category.subIssues.map(s => (
            <li key={s.id}>
              <button className="tw-cat-item" onClick={() => onSelect(s)}>
                <div className="tw-cat-text">
                  <span className="tw-cat-title">{s.title}</span>
                  <span className="tw-cat-desc">{s.hint}</span>
                </div>
                <span className="tw-cat-icon"><IconDoc /></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ── VIEW 3 — Form ─────────────────────────────────────────────────────────────

function ViewForm({ subIssue, onBack, onClose, onSubmit, submitting, activeTab, onTabChange }) {
  const [date,  setDate]  = useState("");
  const [desc,  setDesc]  = useState("");
  const [files, setFiles] = useState([]);

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files).slice(0, 5);
    setFiles(picked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date, desc, files });
  };

  return (
    <>
      <Header title={subIssue.title} subtitle="Fill the required details and upload files if needed." showBack onBack={onBack} onClose={onClose} />
      <div className="tw-body tw-body-form">
        <Tabs active={activeTab} onChange={onTabChange} />
        <form className="tw-form" onSubmit={handleSubmit}>
          <div className="tw-form-group">
            <label className="tw-form-label">When did you notice this? <span className="tw-req">*</span></label>
            <input className="tw-form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="tw-form-group">
            <label className="tw-form-label">Describe the issue <span className="tw-req">*</span></label>
            <textarea className="tw-form-textarea" rows={5} value={desc} onChange={e => setDesc(e.target.value)} required />
          </div>
          <div className="tw-form-group">
            <label className="tw-form-label">Supporting Documents</label>
            <label className="tw-file-drop">
              <IconPaperclip />
              <span className="tw-file-drop-title">Upload files</span>
              <span className="tw-file-drop-hint">JPG, PNG, or PDF. Max 5 files.</span>
              {files.length > 0 && (
                <span className="tw-file-names">{files.map(f => f.name).join(", ")}</span>
              )}
              <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="tw-file-input" onChange={handleFiles} />
            </label>
          </div>
          <button className="tw-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>
    </>
  );
}

// ── VIEW 4 — Ticket created ───────────────────────────────────────────────────

function ViewCreated({ ticket, onNewTicket, onViewThread, onBack, onClose, activeTab, onTabChange }) {
  return (
    <>
      <Header title="Ticket created" subtitle="We have received your support request." showBack onBack={onBack} onClose={onClose} />
      <div className="tw-body tw-body-created">
        <Tabs active={activeTab} onChange={onTabChange} />
        <div className="tw-created-body">
          <div className="tw-created-icon"><IconCheck /></div>
          <h3 className="tw-created-title">Ticket Created</h3>
          <p className="tw-created-desc">Your support ticket has been created successfully.</p>
          <div className="tw-created-meta">
            <div className="tw-meta-row">
              <span className="tw-meta-key">Ticket ID</span>
              <span className="tw-meta-val tw-meta-id">#{ticket.id}</span>
            </div>
            <div className="tw-meta-row">
              <span className="tw-meta-key">Issue</span>
              <span className="tw-meta-val">{ticket.subIssue}</span>
            </div>
            <div className="tw-meta-row">
              <span className="tw-meta-key">Status</span>
              <span className="tw-badge open">Open</span>
            </div>
          </div>
        </div>
        <div className="tw-created-actions">
          <button className="tw-outline-btn" onClick={onNewTicket}>New Ticket</button>
          <button className="tw-dark-btn"    onClick={onViewThread}>View Thread</button>
        </div>
      </div>
    </>
  );
}

// ── VIEW 5 — Thread / chat ────────────────────────────────────────────────────

function ViewThread({ ticket, onBack, onClose, onTicketUpdate }) {
  const [messages, setMessages] = useState(ticket.messages || []);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);

  // Poll for new messages every 15 seconds (replaces WebSocket for now)
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const data = await fetchTicket(ticket.id);
        setMessages(data.data.messages || []);
        if (onTicketUpdate) onTicketUpdate(data.data);
      } catch {
        // silently ignore poll errors
      }
    }, 15000);
    return () => clearInterval(poll);
  }, [ticket.id, onTicketUpdate]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const data = await postMessage(ticket.id, text);
      setMessages(data.data.messages || []);
      if (onTicketUpdate) onTicketUpdate(data.data);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const statusLabel = ticket.status === "resolved" ? "Resolved" : ticket.status === "in_progress" ? "In Progress" : "Open";
  const statusClass = ticket.status === "resolved" ? "resolved" : ticket.status === "in_progress" ? "in-progress" : "open";

  return (
    <>
      <Header title="Support thread" subtitle="Keep this like a simple chat thread." showBack onBack={onBack} onClose={onClose} />
      <div className="tw-thread-wrap">
        {/* Ticket info card */}
        <div className="tw-thread-info-card">
          <div className="tw-thread-info-left">
            <span className="tw-ticket-id">#{ticket.id}</span>
            <span className="tw-ticket-sub">{ticket.subIssue}</span>
          </div>
          <span className={`tw-badge ${statusClass}`}>{statusLabel}</span>
        </div>

        {/* Messages */}
        <div className="tw-messages">
          {/* Attachments — shown above the first message */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="tw-attachments">
              <span className="tw-attachments-label">Attachments</span>
              <div className="tw-attachments-grid">
                {ticket.attachments.map((url, i) => {
                  const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/raw/');
                  return isPdf ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tw-attachment-pdf">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      PDF {i + 1}
                    </a>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tw-attachment-img-wrap">
                      <img src={url} alt={`Attachment ${i + 1}`} className="tw-attachment-img" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`tw-msg tw-msg-${m.sender}`}>
              <span className="tw-msg-sender">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {m.sender === "user" ? "You" : "Support"}
              </span>
              <p className="tw-msg-text">{m.text}</p>
            </div>
          ))}
          <p className="tw-thread-notice">We have received your ticket. Replies from support will appear in this thread.</p>
        </div>

        {/* Input — disabled when resolved */}
        <div className="tw-thread-input-row">
          <input
            className="tw-thread-input"
            placeholder={ticket.status === "resolved" ? "This ticket is resolved." : "Type your message…"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={ticket.status === "resolved" || sending}
          />
          <button
            className="tw-thread-send"
            onClick={send}
            aria-label="Send"
            disabled={ticket.status === "resolved" || sending}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function TicketingWidget() {
  // view: "home" | "subissues" | "form" | "created" | "thread"
  const [view,             setView]             = useState("home");
  const [isOpen,           setIsOpen]           = useState(false);
  const [activeTab,        setActiveTab]        = useState("new");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubIssue, setSelectedSubIssue] = useState(null);
  const [activeTicket,     setActiveTicket]     = useState(null);
  const [tickets,          setTickets]          = useState([]);
  const [ticketsLoading,   setTicketsLoading]   = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [error,            setError]            = useState("");

  // Load tickets when the panel opens or when "My tickets" tab is clicked
  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setError("");
    try {
      const data = await fetchTickets();
      setTickets(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Open: always load tickets so "My tickets" is fresh
  const handleOpen = () => {
    setIsOpen(true);
    loadTickets();
  };

  const reset = () => {
    setView("home");
    setSelectedCategory(null);
    setSelectedSubIssue(null);
    setActiveTicket(null);
    setActiveTab("new");
    setError("");
  };

  const handleClose = () => { setIsOpen(false); reset(); };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (view !== "home") { setView("home"); setSelectedCategory(null); setSelectedSubIssue(null); }
    if (tab === "my") loadTickets();
  };

  const handleCategorySelect  = (cat) => { setSelectedCategory(cat); setView("subissues"); };
  const handleSubIssueSelect  = (sub) => { setSelectedSubIssue(sub); setView("form"); };

  const handleFormSubmit = async ({ date, desc, files }) => {
    setSubmitting(true);
    setError("");
    try {
      const data = await createTicket({
        category:    selectedCategory.title,
        subIssue:    selectedSubIssue.title,
        description: desc,
        dateNoticed: date,
        files,
      });
      const newTicket = data.data;
      setTickets(prev => [newTicket, ...prev]);
      setActiveTicket(newTicket);
      setView("created");
    } catch (err) {
      setError(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewThread = () => setView("thread");

  const handleNewTicket = () => {
    setView("home");
    setSelectedCategory(null);
    setSelectedSubIssue(null);
    setActiveTab("new");
  };

  const handleTicketClick = (t) => { setActiveTicket(t); setView("thread"); };

  // Live-update the active ticket when the thread polls
  const handleTicketUpdate = useCallback((updated) => {
    setActiveTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const handleBack = () => {
    if (view === "subissues")       { setView("home");     setSelectedCategory(null); }
    else if (view === "form")       { setView("subissues"); setSelectedSubIssue(null); }
    else if (view === "created")    { setView("home");     setSelectedCategory(null); setSelectedSubIssue(null); }
    else if (view === "thread")     { setView("home");     setActiveTab("my"); }
  };

  return (
    <>
      {/* FAB */}
      <button className="ticket-fab" onClick={handleOpen} aria-label="Open support" title="Support &amp; Help">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="ticket-backdrop" onClick={handleClose} />
          <div className="ticket-panel">

            {/* Global inline error banner */}
            {error && (
              <div className="tw-error-banner">
                {error}
                <button onClick={() => setError("")}>✕</button>
              </div>
            )}

            {view === "home" && (
              <ViewCategories
                onSelect={handleCategorySelect}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                tickets={tickets}
                ticketsLoading={ticketsLoading}
                onTicketClick={handleTicketClick}
                onClose={handleClose}
              />
            )}

            {view === "subissues" && selectedCategory && (
              <ViewSubIssues
                category={selectedCategory}
                onSelect={handleSubIssueSelect}
                onBack={handleBack}
                onClose={handleClose}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            )}

            {view === "form" && selectedSubIssue && (
              <ViewForm
                subIssue={selectedSubIssue}
                onBack={handleBack}
                onClose={handleClose}
                onSubmit={handleFormSubmit}
                submitting={submitting}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            )}

            {view === "created" && activeTicket && (
              <ViewCreated
                ticket={activeTicket}
                onNewTicket={handleNewTicket}
                onViewThread={handleViewThread}
                onBack={handleBack}
                onClose={handleClose}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            )}

            {view === "thread" && activeTicket && (
              <ViewThread
                ticket={activeTicket}
                onBack={handleBack}
                onClose={handleClose}
                onTicketUpdate={handleTicketUpdate}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
