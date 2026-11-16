import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useTranslation } from "react-i18next";
import { t as tx } from "../i18n";

import { tl } from "../i18n";
import { dateLocale } from "../i18n";

const FinanceChart = ({ transactions = [], dateFilter = "all" }) => {
  const { t: tx } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  console.log("FinanceChart received:", {
    transactionsCount: transactions.length,
    dateFilter,
    sampleTransaction: transactions[0],
  });

  // Helper function to get the actual transaction date
  const getTransactionDate = (transaction) => {
    // Try multiple paths to get the date, prioritizing createdAt
    let date = null;

    // First try createdAt (primary source)
    if (transaction.createdAt) {
      if (transaction.createdAt instanceof Date) {
        date = transaction.createdAt;
      } else if (typeof transaction.createdAt.toDate === "function") {
        date = transaction.createdAt.toDate();
      } else if (typeof transaction.createdAt === "string") {
        date = new Date(transaction.createdAt);
      }
    }

    // If no createdAt found, try the original Firebase date field
    if (!date && transaction.originalData?.date) {
      if (transaction.originalData.date instanceof Date) {
        date = transaction.originalData.date;
      } else if (typeof transaction.originalData.date.toDate === "function") {
        date = transaction.originalData.date.toDate();
      } else if (typeof transaction.originalData.date === "string") {
        date = new Date(transaction.originalData.date);
      }
    }

    // If still no date, try updatedAt as fallback
    if (!date && transaction.updatedAt) {
      if (transaction.updatedAt instanceof Date) {
        date = transaction.updatedAt;
      } else if (typeof transaction.updatedAt.toDate === "function") {
        date = transaction.updatedAt.toDate();
      } else if (typeof transaction.updatedAt === "string") {
        date = new Date(transaction.updatedAt);
      }
    }

    // Last resort - return current date
    if (!date || isNaN(date.getTime())) {
      console.warn("Could not parse transaction date, using current date:", {
        id: transaction.id,
        createdAt: transaction.createdAt,
        originalData: transaction.originalData,
        updatedAt: transaction.updatedAt,
      });
      date = new Date();
    }

    return date;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (date, isSmall = false) => {
    if (isSmall) {
      return date.toLocaleDateString(dateLocale("en-US"), {
        month: "short",
        day: "numeric",
      });
    }
    return date.toLocaleDateString(dateLocale("en-US"), {
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format date range for display
  const formatDateRange = (startDate, endDate, isSmall = false) => {
    if (isSmall) {
      return `${startDate.getDate()}/${
        startDate.getMonth() + 1
      } - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    }
    return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(
      endDate
    )}`;
  };

  // Generate chart data based on the selected date filter
  const chartData = useMemo(() => {
    console.log(
      "Generating chart data with dateFilter:",
      dateFilter,
      "transactions:",
      transactions.length
    );

    // Debug: Log first few transactions to understand data structure
    if (transactions.length > 0) {
      console.log(
        "Sample transactions for debugging:",
        transactions.slice(0, 5).map((t) => ({
          id: t.id,
          amount: t.amount,
          isIncome: t.isIncome,
          type: t.type,
          originalType: t.originalData?.type,
          createdAt: t.createdAt,
          originalData: t.originalData,
          parsedDate: getTransactionDate(t),
        }))
      );

      // Debug: Check how many income vs expense transactions we have
      const incomeTransactions = transactions.filter(
        (t) => t.isIncome === true
      );
      const expenseTransactions = transactions.filter(
        (t) => t.isIncome === false
      );
      console.log("Transaction breakdown:", {
        total: transactions.length,
        income: incomeTransactions.length,
        expenses: expenseTransactions.length,
        incomeAmounts: incomeTransactions.map((t) => t.amount),
        expenseAmounts: expenseTransactions.map((t) => t.amount),
        uniqueTypes: [
          ...new Set(transactions.map((t) => t.originalData?.type)),
        ],
      });
    }

    const now = new Date();
    let chartData = [];

    if (dateFilter === "thisMonth") {
      // Show daily data for current month - only show days that have transactions or recent days
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const currentDay = now.getDate();

      // Show last 10 days or days with transactions, whichever is more relevant
      const startDay = Math.max(1, currentDay - 9);
      const endDay = Math.min(daysInMonth, currentDay);

      for (let day = startDay; day <= endDay; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);

        const dayTransactions = transactions.filter((transaction) => {
          const transactionDate = getTransactionDate(transaction);
          if (!transactionDate || isNaN(transactionDate.getTime()))
            return false;

          return (
            transactionDate.getDate() === day &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          );
        });

        const income = dayTransactions
          .filter((t) => t.isIncome === true)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const expenses = dayTransactions
          .filter((t) => t.isIncome === false)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        console.log(`Day ${day}:`, {
          dayTransactions: dayTransactions.length,
          income,
          expenses,
        });

        chartData.push({
          period: formatDateForDisplay(currentDate, isSmallMobile),
          income: Math.round(income / 1000),
          expenses: Math.round(expenses / 1000),
        });
      }
    } else if (dateFilter === "last30" || dateFilter === "last90") {
      // Show weekly data for last 30/90 days with actual date ranges
      const days = dateFilter === "last30" ? 30 : 90;
      const weeks = Math.ceil(days / 7);

      for (let week = weeks - 1; week >= 0; week--) {
        const endDate = new Date(
          now.getTime() - week * 7 * 24 * 60 * 60 * 1000
        );
        const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);

        const weekTransactions = transactions.filter((transaction) => {
          const transactionDate = getTransactionDate(transaction);
          if (!transactionDate || isNaN(transactionDate.getTime()))
            return false;
          return transactionDate >= startDate && transactionDate <= endDate;
        });

        const income = weekTransactions
          .filter((t) => t.isIncome === true)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const expenses = weekTransactions
          .filter((t) => t.isIncome === false)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        console.log(`Week ${weeks - week}:`, {
          weekTransactions: weekTransactions.length,
          income,
          expenses,
          incomeTransactions: weekTransactions.filter(
            (t) => t.isIncome === true
          ).length,
          expenseTransactions: weekTransactions.filter(
            (t) => t.isIncome === false
          ).length,
        });

        chartData.push({
          period: formatDateRange(startDate, endDate, isSmallMobile),
          income: Math.round(income / 1000),
          expenses: Math.round(expenses / 1000),
        });
      }
    } else {
      // Show weekly data for "all" time (last 12 weeks) with actual date ranges
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);

        const weekTransactions = transactions.filter((transaction) => {
          const transactionDate = getTransactionDate(transaction);
          if (!transactionDate || isNaN(transactionDate.getTime()))
            return false;
          return transactionDate >= startDate && transactionDate <= endDate;
        });

        const incomeTransactions = weekTransactions.filter(
          (t) => t.isIncome === true
        );
        const expenseTransactions = weekTransactions.filter(
          (t) => t.isIncome === false
        );

        const income = incomeTransactions.reduce(
          (sum, t) => sum + (Number(t.amount) || 0),
          0
        );
        const expenses = expenseTransactions.reduce(
          (sum, t) => sum + (Number(t.amount) || 0),
          0
        );

        console.log(
          `Week (${startDate.toDateString()} - ${endDate.toDateString()}):`,
          {
            totalTransactions: weekTransactions.length,
            incomeTransactions: incomeTransactions.length,
            expenseTransactions: expenseTransactions.length,
            income,
            expenses,
            incomeDetails: incomeTransactions.map((t) => ({
              id: t.id,
              amount: t.amount,
              type: t.originalData?.type,
            })),
            expenseDetails: expenseTransactions.map((t) => ({
              id: t.id,
              amount: t.amount,
              type: t.originalData?.type,
            })),
          }
        );

        chartData.push({
          period: formatDateRange(startDate, endDate, isSmallMobile),
          income: Math.round(income / 1000),
          expenses: Math.round(expenses / 1000),
        });
      }
    }

    console.log("Generated chart data:", chartData);
    console.log("Chart data summary:", {
      totalPeriods: chartData.length,
      periodsWithIncome: chartData.filter((d) => d.income > 0).length,
      periodsWithExpenses: chartData.filter((d) => d.expenses > 0).length,
      maxIncome: Math.max(...chartData.map((d) => d.income)),
      maxExpenses: Math.max(...chartData.map((d) => d.expenses)),
    });

    return chartData;
  }, [transactions, dateFilter, isSmallMobile]);

  const formatCurrency = (value) => {
    return `₦${(value * 1000).toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
  useTranslation(); // re-render when the language changes
    if (active && payload && payload.length) {
      return (
        <div className="finance-chart-tooltip">
          <p className="tooltip-label">{tl(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show placeholder data if no real data
  const hasData =
    chartData &&
    chartData.length > 0 &&
    chartData.some((d) => d.income > 0 || d.expenses > 0);

  let displayData = chartData;

  if (!hasData || !chartData || chartData.length === 0) {
    console.log("No data found, using empty data structure");
    // Create empty data structure based on filter with actual dates
    let emptyData = [];
    const now = new Date();

    if (dateFilter === "thisMonth") {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();
      const startDay = Math.max(1, currentDay - 9);
      const endDay = Math.min(
        new Date(currentYear, currentMonth + 1, 0).getDate(),
        currentDay
      );

      for (let day = startDay; day <= endDay; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        emptyData.push({
          period: formatDateForDisplay(currentDate, isSmallMobile),
          income: 0,
          expenses: 0,
        });
      }
    } else if (dateFilter === "last30") {
      const weeks = Math.ceil(30 / 7);
      for (let week = weeks - 1; week >= 0; week--) {
        const endDate = new Date(
          now.getTime() - week * 7 * 24 * 60 * 60 * 1000
        );
        const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
        emptyData.push({
          period: formatDateRange(startDate, endDate, isSmallMobile),
          income: 0,
          expenses: 0,
        });
      }
    } else if (dateFilter === "last90") {
      const weeks = Math.ceil(90 / 7);
      for (let week = weeks - 1; week >= 0; week--) {
        const endDate = new Date(
          now.getTime() - week * 7 * 24 * 60 * 60 * 1000
        );
        const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
        emptyData.push({
          period: formatDateRange(startDate, endDate, isSmallMobile),
          income: 0,
          expenses: 0,
        });
      }
    } else {
      // "all" time - last 12 weeks with actual dates
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
        emptyData.push({
          period: formatDateRange(startDate, endDate, isSmallMobile),
          income: 0,
          expenses: 0,
        });
      }
    }
    displayData = emptyData;
  }

  console.log("Final displayData:", displayData);
  console.log(
    "Chart will render with data:",
    displayData.length > 0 ? "YES" : "NO"
  );
  console.log(
    "Has actual data:",
    displayData.some((d) => d.income > 0 || d.expenses > 0) ? "YES" : "NO"
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {displayData && displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 10 : 20,
              bottom: isSmallMobile ? 60 : 40,
            }}
          >
            <XAxis tickFormatter={(v) => tl(v)}
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: isSmallMobile ? 9 : 11,
                fill: "#94a3b8",
              }}
              interval={isSmallMobile ? 1 : 0}
              angle={isSmallMobile ? -45 : 0}
              textAnchor={isSmallMobile ? "end" : "middle"}
              height={isSmallMobile ? 60 : 40}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: isSmallMobile ? 10 : 12,
                fill: "#94a3b8",
              }}
              tickFormatter={(value) => `${value}k`}
              width={isSmallMobile ? 30 : 40}
            />
            <Tooltip
              content={<CustomTooltip />}
              contentStyle={{
                fontSize: isSmallMobile ? "12px" : "13px",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: isSmallMobile ? "12px" : "14px",
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#16a34a"
              strokeWidth={isSmallMobile ? 2 : 3}
              dot={{
                fill: "#16a34a",
                strokeWidth: 2,
                r: isSmallMobile ? 3 : 4,
              }}
              activeDot={{
                r: isSmallMobile ? 5 : 6,
                fill: "#16a34a",
              }}
              name={tl("Income")}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={isSmallMobile ? 2 : 3}
              dot={{
                fill: "#ef4444",
                strokeWidth: 2,
                r: isSmallMobile ? 3 : 4,
              }}
              activeDot={{
                r: isSmallMobile ? 5 : 6,
                fill: "#ef4444",
              }}
              name={tl("Expenses")}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#94a3b8",
            fontSize: isSmallMobile ? "12px" : "14px",
          }}
        >
          {tx("auto.loadingChartData_8bde")}
        </div>
      )}
    </div>
  );
};

export default FinanceChart;
