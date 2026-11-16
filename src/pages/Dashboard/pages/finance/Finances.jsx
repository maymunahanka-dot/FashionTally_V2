import { useState, useEffect, useContext } from "react";
import { Search, Filter, Plus, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import Button from "../../../../components/button/Button";
import SortByButton, { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddTransactionPanel from "../../../../pannel_pages/AddTransactionPanel";
import TransactionDetailsPanel from "../../../../pannel_pages/TransactionDetailsPanel/TransactionDetailsPanel";
import FinanceChart from "../../../../components/FinanceChart";
import { MoneyAmount } from "../../../../components/MoneyAmount/MoneyAmount";
import "./Finances.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const Finances = () => {
  const { t: tx } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.finances");
  const [showSort, setShowSort] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { user } = useContext(NewAuthContext);

  const fetchTransactions = async () => {
    if (!user?.email) { setLoading(false); setTransactions([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transaction/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.map((t) => {
          const isIncome = String(t.type || "").toLowerCase().trim() === "income";
          return {
          ...t,
          id: t.id || t._id,
          title: t.description || "Transaction",
          type: isIncome ? "Sales" : "Purchase",
          isIncome,
          vendor: isIncome ? "Customer Payment" : "Vendor",
          referenceNumber: t.reference || `TXN-${(t.id || "").slice(-6).toUpperCase()}`,
          status: "completed",
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
          date: t.date ? new Date(t.date).toLocaleDateString(dateLocale("en-US"), { month: "short", day: "numeric" }) : new Date().toLocaleDateString(dateLocale("en-US"), { month: "short", day: "numeric" }),
          };
        }).sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [user?.email]);

  // Calculate stats from real data
  const calculateStats = () => {
    console.log("Calculating stats with transactions:", transactions.length);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      if (isCurrentMonth) {
        console.log(
          "Current month transaction:",
          transaction.title,
          transaction.amount,
          transaction.isIncome
        );
      }

      return isCurrentMonth;
    });

    console.log("Current month transactions:", currentMonthTransactions.length);

    const totalIncome = currentMonthTransactions
      .filter((t) => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => !t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    console.log("Stats calculated:", { totalIncome, totalExpenses, netProfit });

    return {
      netProfit,
      totalIncome,
      totalExpenses,
      monthlyProfit: netProfit,
    };
  };

  const stats = calculateStats();

  const financeData = {
    month: new Date().toLocaleDateString(dateLocale("en-US"), {
      month: "long",
      year: "numeric",
    }),
    stats: [
      { label: "Net Profit", value: stats.netProfit, color: "#16988d" },
      { label: "Total Income", value: stats.totalIncome, color: "#16988d" },
      { label: "Total Expenses", value: stats.totalExpenses, color: "#16988d" },
      { label: "Monthly Profit", value: stats.monthlyProfit, color: "#16988d" },
    ],
  };

  const handleAddTransactionClick = () => {
    setEditMode(false);
    setEditingTransaction(null);
    setShowAddTransaction(true);
  };

  const handleCloseAddTransaction = () => {
    setShowAddTransaction(false);
    setEditMode(false);
    setEditingTransaction(null);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleCloseTransactionDetails = () => {
    setShowTransactionDetails(false);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditMode(true);
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = async (transactionId, transactionTitle) => {
    if (!user?.email) return;
    if (!window.confirm(tx("tpl.areYouSureYouWant_1beb", { v0: transactionTitle }))) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transaction/delete/${transactionId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) fetchTransactions();
      else alert(tx("auto.failedToDeleteTransactionPlease_6ddd"));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert(tx("auto.failedToDeleteTransactionPlease_6ddd"));
    }
  };

  const handleTransactionSaved = (transactionData) => {
    // Handle the transaction creation/update logic here
    console.log("Transaction saved:", transactionData);
    // The actual saving is handled in AddTransactionPanel
  };

  // Filter transactions based on search, type, and date
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "income" && transaction.isIncome) ||
      (filterType === "expense" && !transaction.isIncome);

    const matchesDate = (() => {
      if (
        !transaction.createdAt ||
        !(transaction.createdAt instanceof Date) ||
        isNaN(transaction.createdAt.getTime())
      ) {
        return false; // Skip transactions with invalid dates
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case "last30":
          return transaction.createdAt >= thirtyDaysAgo;
        case "last90":
          return transaction.createdAt >= ninetyDaysAgo;
        case "thisMonth":
          return (
            transaction.createdAt.getMonth() === now.getMonth() &&
            transaction.createdAt.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesDate;
  }).sort((a, b) => {
    const toTime = (value) => {
      if (!value) return 0;
      const date = value instanceof Date ? value : new Date(value);
      const time = date.getTime();
      return Number.isNaN(time) ? 0 : time;
    };
    if (sortBy === "name-asc" || sortBy === "name-desc") {
      const compared = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
      return sortBy === "name-asc" ? compared : -compared;
    }
    if (sortBy === "amount") {
      return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    }
    const createdDiff = toTime(b.createdAt) - toTime(a.createdAt);
    return sortBy === "oldest" ? -createdDiff : createdDiff;
  });

  return (
    <div className="finn_finance_management">
      {/* Header */}
      <div className="finn_finance_header">
        <h1 className="finn_finance_title">{tx("auto.yourFinanceManagement_478b")}</h1>
      </div>

      {/* Stats Section */}
      <div className="finn_finance_stats_section">
        <div className="finn_ipo">
          <div className="finn_ipols">
            <h1>{tx("auto.finances_4f05")}</h1>
            <p>{tx("auto.manageYourFinances_47f0")}</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={24} />}
            onClick={handleAddTransactionClick}
            className="finn_ipolsbbb"
          />
        </div>
        <div className="finn_stats_header">
          <h2 className="finn_stats_period">{tl(financeData.month)}</h2>
          <div className="finn_stats_actions">
            <select
              className="finn_date_filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">{tx("auto.allTime_dbad")}</option>
              <option value="last30">{tx("auto.last30Days_6b32")}</option>
              <option value="last90">{tx("auto.last90Days_c328")}</option>
              <option value="thisMonth">{tx("auto.thisMonth_1b47")}</option>
            </select>
          </div>
        </div>
        <div className="finn_finance_stats">
          {financeData.stats.map((stat, index) => (
            <div key={index} className="finn_stat_card">
              <div className="finn_stat_content">
                <h3 className="finn_stat_title">{tl(stat.label)}</h3>
                <p className="finn_stat_value"><MoneyAmount amount={stat.value} /></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="finn_jkj">
        {/* Search and Add Transaction Section */}
        <div className="finn_finance_controls">
          <div className="search-sort-row">
          <div className="finn_search_section">
            <div className="finn_search_input_container">
              <Search className="finn_search_icon" size={20} />
              <input
                type="text"
                placeholder={tx("auto.searchClientsByNamePhone_9984")}
                className="finn_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="finn_filter_btn_inside"
                onClick={() => {
                  setShowFilter(!showFilter);
                  setShowSort(false);
                }}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="finn_filter_dropdown">
                  <div className="finn_filter_option">
                    <input
                      type="radio"
                      id="all-transactions"
                      name="transaction_filter"
                      value="all"
                      checked={filterType === "all"}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="all-transactions">{tx("auto.allTransactions_f46e")}</label>
                  </div>
                  <div className="finn_filter_option">
                    <input
                      type="radio"
                      id="income-transactions"
                      name="transaction_filter"
                      value="income"
                      checked={filterType === "income"}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="income-transactions">{tx("auto.income_1c89")}</label>
                  </div>
                  <div className="finn_filter_option">
                    <input
                      type="radio"
                      id="expense-transactions"
                      name="transaction_filter"
                      value="expense"
                      checked={filterType === "expense"}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="expense-transactions">{tx("auto.expenses_8d43")}</label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <SortByButton
            value={sortBy}
            onChange={setSortBy}
            open={showSort}
            onToggle={() => {
              setShowSort((open) => !open);
              setShowFilter(false);
            }}
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "name-asc", label: "Name (A–Z)" },
              { value: "name-desc", label: "Name (Z–A)" },
              { value: "amount", label: "Amount" },
            ]}
          />
          </div>

          <button
            className="finn_add_transaction_btn"
            onClick={handleAddTransactionClick}
          >
            <Plus size={20} />
            {tx("auto.addTransaction_ea77")}
          </button>
        </div>

        {/* Chart Section */}
        <div className="finn_chart_section">
          <div className="finn_chart_header">
            <h3 className="finn_chart_title">{tx("auto.incomeVsExpenses_800c")}</h3>
            <div className="finn_chart_period">
              {dateFilter === "all" && tx("auto.allTime_4745")}
              {dateFilter === "last30" && tx("auto.last30Days_6118")}
              {dateFilter === "last90" && tx("auto.last90Days_ce96")}
              {dateFilter === "thisMonth" && tx("auto.thisMonth_0f6c")}
            </div>
          </div>

          <div className="finn_chart_container">
            <FinanceChart
              transactions={filteredTransactions}
              dateFilter={dateFilter}
            />
            {/* Debug info */}
            {process.env.NODE_ENV === "development" && (
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}
              >
                {tx("auto.debug_4a08")}{" "}{tl(transactions.length)}{" "}{tx("auto.total_195f")}{" "}
                {tl(filteredTransactions.length)}{" "}{tx("auto.filteredTransactions_611a")}
              </div>
            )}
          </div>

          <div className="finn_chart_legend">
            <div className="finn_legend_item">
              <div className="finn_legend_dot income"></div>
              <span>{tx("auto.income_1c89")}</span>
            </div>
            <div className="finn_legend_item">
              <div className="finn_legend_dot expenses"></div>
              <span>{tx("auto.expenses_8d43")}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="finn_transactions_section">
          <div className="finn_transactions_header">
            <h3 className="finn_transactions_title">{tx("auto.recentTransactions_f28b")}</h3>
            <button className="finn_view_all_btn">{tx("auto.viewAll_efd8")}</button>
          </div>

          <div className="finn_transactions_list">
            {loading ? (
              <div className="finn_loading">
                <p>{tx("auto.loadingTransactions_3665")}</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="finn_no_transactions">
                <Wallet size={48} />
                <h3>{tx("auto.noTransactionsFound_d60c")}</h3>
                <p>
                  {tl(searchTerm || filterType !== "all"
                    ? tx("auto.tryAdjustingYourSearchOr_e210")
                    : tx("auto.addYourFirstTransactionTo_2017"))}
                </p>
                <Button
                  variant="primary"
                  size="medium"
                  icon={<Plus size={16} />}
                  onClick={handleAddTransactionClick}
                >
                  {tx("auto.addTransaction_ea77")}
                </Button>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="finn_transaction_item"
                  onClick={() => handleTransactionClick(transaction)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="finn_transaction_icon_container">
                    <div
                      className={`finn_transaction_icon ${
                        transaction.isIncome ? "income" : "expense"
                      }`}
                    >
                      {transaction.isIncome ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                    </div>
                  </div>

                  <div className="finn_transaction_content">
                    <div className="finn_transaction_details">
                      <h4 className="finn_transaction_title">
                        {tl(transaction.title)}
                      </h4>
                      <div className="finn_transaction_meta">
                        <span
                          className={`finn_transaction_type_badge ${
                            transaction.isIncome ? "income" : "expense"
                          }`}
                        >
                          {tl(transaction.type)}
                        </span>
                        <span className="finn_transaction_separator">•</span>
                        <div className="finn_transaction_date_wrapper">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="finn_calendar_icon"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <line
                              x1="16"
                              y1="2"
                              x2="16"
                              y2="6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <line
                              x1="8"
                              y1="2"
                              x2="8"
                              y2="6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <line
                              x1="3"
                              y1="10"
                              x2="21"
                              y2="10"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          <span className="finn_transaction_date">
                            {tl(transaction.date)}
                          </span>
                        </div>
                      </div>
                      <p className="finn_transaction_category">
                        {tl(transaction.category)}
                      </p>
                    </div>

                    <div
                      className={`finn_transaction_amount ${
                        transaction.isIncome ? "income" : "expense"
                      }`}
                    >
                      <MoneyAmount
                        amount={transaction.amount}
                        prefix={transaction.isIncome ? "+" : ""}
                        align="end"
                      />
                    </div>
                  </div>

                  <div className="finn_transaction_arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Transaction Panel */}
        <SlideInMenu
          isShow={showAddTransaction}
          onClose={handleCloseAddTransaction}
          position="rightt"
          width="480px"
        >
          <AddTransactionPanel
            onClose={handleCloseAddTransaction}
            onSubmit={handleTransactionSaved}
            editingTransaction={editingTransaction}
            editMode={editMode}
            onSuccess={fetchTransactions}
          />
        </SlideInMenu>

        {/* Transaction Details Panel */}
        <SlideInMenu
          isShow={showTransactionDetails}
          onClose={handleCloseTransactionDetails}
          position="rightt"
          width="500px"
        >
          <TransactionDetailsPanel
            transaction={selectedTransaction}
            onClose={handleCloseTransactionDetails}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </SlideInMenu>
      </div>
    </div>
  );
};

export default Finances;
