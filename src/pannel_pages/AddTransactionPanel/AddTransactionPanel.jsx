import { useState, useContext } from "react";
import { X, ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input";
import "./AddTransactionPanel.css";

const AddTransactionPanel = ({ onClose, onSubmit, editingTransaction, editMode, onSuccess }) => {
  const { user } = useContext(NewAuthContext);
  const [loading, setLoading] = useState(false);

  // Form state - initialize with editing data if available
  const [transactionType, setTransactionType] = useState(
    editingTransaction
      ? editingTransaction.isIncome
        ? "income"
        : "expense"
      : "expense"
  );
  const [amount, setAmount] = useState(
    editingTransaction?.amount?.toString() || ""
  );
  const [category, setCategory] = useState(editingTransaction?.category || "");
  const [description, setDescription] = useState(
    editingTransaction?.description || ""
  );
  const [date, setDate] = useState(
    editingTransaction?.createdAt
      ? editingTransaction.createdAt.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(
    editingTransaction?.paymentMethod?.toLowerCase().replace(" ", "_") || "cash"
  );
  const [reference, setReference] = useState(
    editingTransaction?.referenceNumber || ""
  );
  const [notes, setNotes] = useState(editingTransaction?.notes || "");

  const [errors, setErrors] = useState({});

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

    if (!amount.trim() || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!date.trim()) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      alert("User not authenticated");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        description,
        amount: parseFloat(amount),
        type: transactionType === "income" ? "Income" : "Expense",
        category,
        date: date || new Date().toISOString(),
        paymentMethod: paymentMethod.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        reference: reference || `TXN-${Date.now().toString().slice(-6)}`,
        notes,
      };

      let res;
      if (editMode && editingTransaction?.id) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/transaction/edit/${editingTransaction.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/transaction/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      }

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to save transaction");

      if (onSubmit) onSubmit(payload);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="add_trans_panel">
      {/* Header */}
      <div className="add_trans_header">
        <button className="add_trans_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="add_trans_title">
          {editMode ? "Edit Transaction" : "Add Transaction"}
        </h2>
      </div>

      {/* Form */}
      <form className="add_trans_form" onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="add_trans_form_group">
          <label className="add_trans_label">Type</label>
          <div className="add_trans_type_buttons">
            <button
              type="button"
              className={`add_trans_type_btn ${
                transactionType === "income" ? "active income" : ""
              }`}
              onClick={() => setTransactionType("income")}
            >
              <ArrowUpCircle size={24} />
              <span>Income</span>
            </button>
            <button
              type="button"
              className={`add_trans_type_btn ${
                transactionType === "expense" ? "active expense" : ""
              }`}
              onClick={() => setTransactionType("expense")}
            >
              <ArrowDownCircle size={24} />
              <span>Expense</span>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="add_trans_form_group">
          <Input
            label="Amount (₦) *"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              clearError("amount");
            }}
            error={errors.amount}
            required
            variant="rounded"
            min="0"
            step="0.01"
          />
        </div>

        {/* Category */}
        <div className="add_trans_form_group">
          <Input
            label="Category *"
            type="select"
            placeholder="Select category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              clearError("category");
            }}
            error={errors.category}
            required
            variant="rounded"
            options={[
              { value: "", label: "Select category" },
              { value: "Sales", label: "Sales" },
              { value: "Materials", label: "Materials" },
              { value: "Equipment", label: "Equipment" },
              { value: "Marketing", label: "Marketing" },
              { value: "Utilities", label: "Utilities" },
              { value: "Rent", label: "Rent" },
              { value: "Transportation", label: "Transportation" },
              { value: "Other", label: "Other" },
            ]}
          />
        </div>

        {/* Description */}
        <div className="add_trans_form_group">
          <Input
            label="Description *"
            type="textarea"
            placeholder="Add details about this transaction..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            error={errors.description}
            required
            variant="rounded"
            rows={4}
          />
        </div>

        {/* Date and Payment Method Row */}
        <div className="add_trans_form_row">
          <div className="add_trans_form_group add_trans_form_group_half">
            <Input
              label="Date *"
              type="date"
              placeholder="DD/MM/YYYY"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError("date");
              }}
              error={errors.date}
              required
              variant="rounded"
            />
          </div>
          <div className="add_trans_form_group add_trans_form_group_half">
            <Input
              label="Payment"
              type="select"
              placeholder="Cash"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              variant="rounded"
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "credit_card", label: "Credit Card" },
                { value: "check", label: "Check" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
        </div>

        {/* Reference Number */}
        <div className="add_trans_form_group">
          <Input
            label="Reference Number (Optional)"
            type="text"
            placeholder="Enter reference number"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Notes */}
        <div className="add_trans_form_group">
          <Input
            label="Notes (Optional)"
            type="textarea"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="add_trans_submit_btn"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editMode
            ? "Update Transaction"
            : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionPanel;
