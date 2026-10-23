import { useState } from "react";
import { X, Download, Share2, Calendar, Edit3, Trash2 } from "lucide-react";
import Button from "../../components/button/Button";
import { useTheme } from "../../contexts/ThemeContext";
import { MoneyAmount } from "../../components/MoneyAmount/MoneyAmount";
import "./TransactionDetailsPanel.css";

const TransactionDetailsPanel = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { isDark } = useTheme();

  if (!transaction) return null;

  // Use real transaction data
  const transactionDetails = {
    id: transaction.id,
    title: transaction.title || transaction.description,
    type: transaction.isIncome ? "Income" : "Expense",
    category: transaction.category,
    amount: transaction.amount,
    isIncome: transaction.isIncome,
    date: transaction.date,
    referenceNumber: transaction.referenceNumber,
    transactionTime: transaction.createdAt
      ? transaction.createdAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unknown",
    vendor: transaction.vendor,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status || "completed",
    subtotal: transaction.amount,
    totalAmount: transaction.amount,
    notes: transaction.notes,
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction.id, transaction.title || transaction.description);
    }
    onClose();
  };

  return (
    <div
      className={`tdp_transaction_details_panel ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      {/* Header */}
      <div className="tdp_panel_header">
        <button className="tdp_close_btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="tdp_panel_title">Transaction Details</h2>
        <div className="tdp_header_actions">
          <button className="tdp_action_btn tdp_edit_btn" onClick={handleEdit}>
            <Edit3 size={16} />
          </button>
          <button
            className="tdp_action_btn tdp_delete_btn"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="tdp_action_btn tdp_share_btn"
            onClick={() => console.log("Share")}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="tdp_panel_content">
        {/* Transaction Summary Card */}
        <div className="tdp_transaction_card">
          <div className="tdp_card_header">
            <div className="tdp_transaction_icon_container">
              <div
                className={`tdp_transaction_icon ${
                  transactionDetails.isIncome ? "income" : "expense"
                }`}
              >
                {transactionDetails.isIncome ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 17L7 7M7 7H17M7 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="tdp_card_info">
              <h3 className="tdp_card_title">{transactionDetails.title}</h3>
              <p className="tdp_card_subtitle">{transactionDetails.category}</p>
            </div>

            <div className="tdp_card_amount">
              <span
                className={`tdp_amount_value ${
                  transactionDetails.isIncome ? "income" : "expense"
                }`}
              >
                <MoneyAmount
                  amount={transactionDetails.amount}
                  prefix={transactionDetails.isIncome ? "+" : "-"}
                  align="end"
                />
              </span>
            </div>
          </div>

          <div className="tdp_card_footer">
            <div
              className={`tdp_${
                transactionDetails.isIncome ? "income" : "expense"
              }_badge`}
            >
              <span>{transactionDetails.type}</span>
            </div>
            <div className="tdp_date_info">
              <Calendar size={14} />
              <span>{transactionDetails.date}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="tdp_details_list">
          <div className="tdp_detail_item">
            <span className="tdp_detail_label">Reference Number</span>
            <span className="tdp_detail_value">
              {transactionDetails.referenceNumber}
            </span>
          </div>

          <div className="tdp_detail_item">
            <span className="tdp_detail_label">Transaction Time</span>
            <span className="tdp_detail_value">
              {transactionDetails.transactionTime}
            </span>
          </div>

          <div className="tdp_detail_item">
            <span className="tdp_detail_label">Vendor</span>
            <span className="tdp_detail_value">
              {transactionDetails.vendor}
            </span>
          </div>

          <div className="tdp_detail_item">
            <span className="tdp_detail_label">Payment Method</span>
            <span className="tdp_detail_value">
              {transactionDetails.paymentMethod}
            </span>
          </div>

          <div className="tdp_detail_item">
            <span className="tdp_detail_label">Status</span>
            <span className="tdp_status_badge completed">completed</span>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="tdp_amount_breakdown_section">
          <h4 className="tdp_breakdown_title">Amount Breakdown</h4>

          <div className="tdp_breakdown_item">
            <span className="tdp_breakdown_label">Subtotal</span>
            <span className="tdp_breakdown_value">
              <MoneyAmount amount={transactionDetails.subtotal} align="end" />
            </span>
          </div>

          <div className="tdp_breakdown_total">
            <span className="tdp_total_label">Total Amount</span>
            <span
              className={`tdp_total_value ${
                transactionDetails.isIncome ? "income" : "expense"
              }`}
            >
              <MoneyAmount
                amount={transactionDetails.totalAmount}
                prefix={transactionDetails.isIncome ? "+" : "-"}
                align="end"
              />
            </span>
          </div>
        </div>

        {/* Additional Details Section */}
        {transactionDetails.notes && (
          <div className="tdp_notes_section">
            <h4 className="tdp_notes_title">Notes</h4>
            <p className="tdp_notes_content">{transactionDetails.notes}</p>
          </div>
        )}

        {/* Download Button */}
        <div className="tdp_download_section">
          <Button
            variant="primary"
            size="large"
            icon={<Download size={20} />}
            onClick={() => console.log("Download receipt")}
            className="tdp_download_receipt_btn"
          >
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsPanel;
