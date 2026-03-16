import { useState, useEffect, useContext } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../../backend/firebase.config";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddTransactionPanel from "../../../../pannel_pages/AddTransactionPanel";
import TransactionDetailsPanel from "../../../../pannel_pages/TransactionDetailsPanel/TransactionDetailsPanel";
import FinanceChart from "../../../../components/FinanceChart";
import "./Finances.css";

const Finances = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { user } = useContext(NewAuthContext);

  // Fetch transactions from Firebase with real-time updates
  useEffect(() => {
    if (!db || !user?.email) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);

    // Get effective email (main admin's email for team members)
    const effectiveEmail = getEffectiveUserEmail(user);

    // Set up the query to filter by effective user's email
    const transactionsQuery = query(
      collection(db, "fashiontally_transactions"),
      where("userEmail", "==", effectiveEmail),
      orderBy("createdAt", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        console.log(
          "Firebase snapshot received:",
          snapshot.docs.length,
          "documents"
        );

        const transactionsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Processing transaction:", doc.id, data);
          console.log("Transaction type check:", {
            originalType: data.type,
            isIncomeCheck: data.type === "Income",
            isExpenseCheck: data.type === "Expense",
          });

          return {
            id: doc.id,
            title: data.description || "Transaction",
            type: data.type === "Income" ? "Sales" : "Purchase",
            date: (() => {
              let d = data.date;
              if (!d) return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
              if (typeof d.toDate === "function") d = d.toDate();
              else if (d._seconds !== undefined) d = new Date(d._seconds * 1000);
              else d = new Date(d);
              return isNaN(d) ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            })(),
            category: data.category || "Other",
            amount: data.amount || 0,
            isIncome: data.type === "Income",
            description: data.description || "",
            vendor: data.type === "Income" ? "Customer Payment" : "Vendor",
            paymentMethod: data.paymentMethod || "Cash",
            referenceNumber:
              data.reference || `TXN-${doc.id.slice(-6).toUpperCase()}`,
            status: "completed",
            notes: data.notes || "",
            createdAt: data.createdAt?.toDate?.() ?? (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : new Date(data.createdAt || Date.now())),
            updatedAt: data.updatedAt?.toDate?.() ?? (data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date(data.updatedAt || Date.now())),
            // Store original data for editing
            originalData: data,
          };
        });

        console.log("Processed transactions:", transactionsData);

        // Debug: Log transaction type distribution
        const incomeTransactions = transactionsData.filter(
          (t) => t.isIncome === true
        );
        const expenseTransactions = transactionsData.filter(
          (t) => t.isIncome === false
        );
        console.log("Transaction distribution:", {
          total: transactionsData.length,
          income: incomeTransactions.length,
          expenses: expenseTransactions.length,
          incomeTypes: incomeTransactions.map((t) => t.originalData?.type),
          expenseTypes: expenseTransactions.map((t) => t.originalData?.type),
        });

        setTransactions(transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [user?.email]);

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
    month: new Date().toLocaleDateString("en-US", {
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

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the transaction "${transactionTitle}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "fashiontally_transactions", transactionId));
      console.log("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
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
  });

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="finn_finance_management">
      {/* Header */}
      <div className="finn_finance_header">
        <h1 className="finn_finance_title">Your Finance Management</h1>
      </div>

      {/* Stats Section */}
      <div className="finn_finance_stats_section">
        <div className="finn_ipo">
          <div className="finn_ipols">
            <h1>Finances</h1>
            <p>Manage your finances</p>
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
          <h2 className="finn_stats_period">{financeData.month}</h2>
          <div className="finn_stats_actions">
            <select
              className="finn_date_filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="thisMonth">This month</option>
            </select>
          </div>
        </div>
        <div className="finn_finance_stats">
          {financeData.stats.map((stat, index) => (
            <div key={index} className="finn_stat_card">
              <div className="finn_stat_content">
                <h3 className="finn_stat_title">{stat.label}</h3>
                <p className="finn_stat_value">{formatCurrency(stat.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="finn_jkj">
        {/* Search and Add Transaction Section */}
        <div className="finn_finance_controls">
          <div className="finn_search_section">
            <div className="finn_search_input_container">
              <Search className="finn_search_icon" size={20} />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email"
                className="finn_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="finn_filter_btn_inside"
                onClick={() => setShowFilter(!showFilter)}
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
                    <label htmlFor="all-transactions">All Transactions</label>
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
                    <label htmlFor="income-transactions">Income</label>
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
                    <label htmlFor="expense-transactions">Expenses</label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="finn_add_transaction_btn"
            onClick={handleAddTransactionClick}
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>

        {/* Chart Section */}
        <div className="finn_chart_section">
          <div className="finn_chart_header">
            <h3 className="finn_chart_title">Income vs Expenses</h3>
            <div className="finn_chart_period">
              {dateFilter === "all" && "All Time"}
              {dateFilter === "last30" && "Last 30 Days"}
              {dateFilter === "last90" && "Last 90 Days"}
              {dateFilter === "thisMonth" && "This Month"}
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
                Debug: {transactions.length} total,{" "}
                {filteredTransactions.length} filtered transactions
              </div>
            )}
          </div>

          <div className="finn_chart_legend">
            <div className="finn_legend_item">
              <div className="finn_legend_dot income"></div>
              <span>Income</span>
            </div>
            <div className="finn_legend_item">
              <div className="finn_legend_dot expenses"></div>
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="finn_transactions_section">
          <div className="finn_transactions_header">
            <h3 className="finn_transactions_title">Recent Transactions</h3>
            <button className="finn_view_all_btn">View All</button>
          </div>

          <div className="finn_transactions_list">
            {loading ? (
              <div className="finn_loading">
                <p>Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="finn_no_transactions">
                <Wallet size={48} />
                <h3>No transactions found</h3>
                <p>
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter"
                    : "Add your first transaction to get started"}
                </p>
                <Button
                  variant="primary"
                  size="medium"
                  icon={<Plus size={16} />}
                  onClick={handleAddTransactionClick}
                >
                  Add Transaction
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
                        {transaction.title}
                      </h4>
                      <div className="finn_transaction_meta">
                        <span
                          className={`finn_transaction_type_badge ${
                            transaction.isIncome ? "income" : "expense"
                          }`}
                        >
                          {transaction.type}
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
                            {transaction.date}
                          </span>
                        </div>
                      </div>
                      <p className="finn_transaction_category">
                        {transaction.category}
                      </p>
                    </div>

                    <div
                      className={`finn_transaction_amount ${
                        transaction.isIncome ? "income" : "expense"
                      }`}
                    >
                      {transaction.isIncome ? "+" : ""}₦
                      {transaction.amount.toLocaleString()}
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
