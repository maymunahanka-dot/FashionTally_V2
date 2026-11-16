import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, UserPlus, Users } from "lucide-react";
import { useNewAuth } from "../../../../contexts/NewAuthContext";
import { useSubscription } from "../../../../hooks/use-subscription";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import {
  getTodaysAppointments,
  getDashboardStats,
  getSalesChartData,
} from "../../../../backend/services/crmService";
import SalesChart from "../../../../components/SalesChart";
import { useDisplayCurrency } from "../../../../utils/useDisplayCurrency";
import { formatCompactMoney } from "../../../../utils/exchangeRate";
import CircularStat from "../../../../components/CircularStat";
import DashboardNotification from "../../../../pannel_pages/DashboardNotification";
import AddInventoryPanel from "../../../../pannel_pages/AddInventoryPanel";
import NewOrderPanel from "../../../../pannel_pages/NewOrderPanel";
import AddClientPanel from "../../../../pannel_pages/AddClientPanel";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import "./DashboardOverview.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const DashboardOverview = () => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const subscription = useSubscription();
  const { user } = useNewAuth();
  const displayCurrency = useDisplayCurrency();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount]             = useState(0);

  // Fetch unread notification count for the bell badge
  useEffect(() => {
    if (!user?.email) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/notifications/user/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(data.data.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => {});
  }, [user?.email]);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [salesChartData, setSalesChartData] = useState([]);
  const [, setChartLoading] = useState(true);

  // Use the new auth system
  const currentUser = user;

  // Load today's appointments
  useEffect(() => {
    const loadTodaysAppointments = async () => {
      if (!user?.email) {
        setAppointmentsLoading(false);
        return;
      }

      try {
        setAppointmentsLoading(true);
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);
        const appointments = await getTodaysAppointments(effectiveEmail);
        setTodaysAppointments(appointments);
      } catch (error) {
        console.error("Error loading today's appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadTodaysAppointments();
  }, [user?.email]);

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      console.log("🔄 Loading dashboard stats for user:", user?.email);

      if (!user?.email) {
        console.warn("❌ No user email, skipping stats loading");
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);
        console.log(
          "📊 Calling getDashboardStats with effective email:",
          effectiveEmail
        );
        const stats = await getDashboardStats(effectiveEmail);
        console.log("✅ Dashboard stats received:", stats);
        setDashboardStats(stats);
      } catch (error) {
        console.error("❌ Error loading dashboard stats:", error);
      } finally {
        setStatsLoading(false);
        console.log("🏁 Dashboard stats loading completed");
      }
    };

    loadDashboardStats();
  }, [user?.email]);

  // Load sales chart data
  useEffect(() => {
    const loadSalesChartData = async () => {
      console.log("📈 Loading sales chart data for user:", user?.email);

      if (!user?.email) {
        console.warn("❌ No user email, skipping chart loading");
        setChartLoading(false);
        return;
      }

      try {
        setChartLoading(true);
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);
        console.log(
          "📊 Calling getSalesChartData with effective email:",
          effectiveEmail
        );
        const chartData = await getSalesChartData(effectiveEmail);
        console.log("✅ Sales chart data received:", chartData);
        setSalesChartData(chartData);
      } catch (error) {
        console.error("❌ Error loading sales chart data:", error);
      } finally {
        setChartLoading(false);
        console.log("🏁 Sales chart loading completed");
      }
    };

    loadSalesChartData();
  }, [user?.email]);



  // Without an active plan, orders and inventory are locked: send people to the
  // page instead, which shows the "subscribe to unlock" screen.
  const toggleAddInventory = () => {
    if (!subscription.loading && !subscription.isSubscribed) return navigate("/dashboard/inventory");
    setShowAddInventory(!showAddInventory);
  };

  const toggleNewOrder = () => {
    if (!subscription.loading && !subscription.isSubscribed) return navigate("/dashboard/orders");
    setShowNewOrder(!showNewOrder);
  };

  const toggleAddClient = () => {
    setShowAddClient(!showAddClient);
  };

  const handleCRMClick = () => {
    navigate("/dashboard/crm");
  };

  const handleSeeMoreAppointments = () => {
    navigate("/dashboard/appointments");
  };

  const formatAppointmentStatus = (status) => {
    switch (status) {
      case "Scheduled":
        return "Confirmed";
      case "Completed":
        return "Completed";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  // Totals are saved in Naira; show them in the business's display currency
  const formatCurrency = (amount) =>
    formatCompactMoney(amount, displayCurrency.currency, displayCurrency.ngnPerUnit);

  const formatPercentage = (value) => {
    console.log("📊 formatPercentage called with:", value, typeof value);
    if (!value || isNaN(value)) {
      console.log("📊 formatPercentage returning 0% for invalid value");
      return "0%";
    }
    const sign = value >= 0 ? "+" : "";
    const formatted = `${sign}${Number(value).toFixed(1)}%`;
    console.log("📊 formatPercentage returning:", formatted);
    return formatted;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString(dateLocale("en-US"), {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getLastUpdatedTime = () => {
    if (!dashboardStats?.lastUpdated) return "Just now";

    const now = new Date();
    const updated = new Date(dashboardStats.lastUpdated);
    const diffInSeconds = Math.floor((now - updated) / 1000);

    if (diffInSeconds < 60) return tx("tpl.secsAgo_e73c", { v0: diffInSeconds });
    if (diffInSeconds < 3600)
      return tx("tpl.minsAgo_173d", { v0: Math.floor(diffInSeconds / 60) });
    return tx("tpl.hrsAgo_bac5", { v0: Math.floor(diffInSeconds / 3600) });
  };


  return (
    <div className="dashboard-overview">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        {/* Abstract Background Pattern */}
        <div className="welcome-bg-pattern"></div>

        <div className="welcome-content-wrapper">
          <div className="kkk">
            <div className="welcome-user-section">
              <div className="user-avatar-container">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="User"
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-initials">
                    {currentUser?.name
                      ? currentUser.name
                          .split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : currentUser?.email
                      ? currentUser.email.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">
                  {tx("auto.welcomeBack_8c8b")}{" "}{tl(currentUser?.name || tx("auto.user_9f8a"))}!
                </h1>
              </div>
            </div>
            <p className="welcome-subtitle">
              {tx("auto.hereSAnOverviewOf_3f5f")}
            </p>
          </div>
          <div className="welcome-banner-actions">
            <button className="notif-bell-btn" onClick={() => setShowNotifications(true)} title={tx("auto.notifications_753a")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className="notif-bell-badge">{tl(unreadCount > 99 ? "99+" : unreadCount)}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <SlideInMenu
        isShow={showNotifications}
        onClose={() => setShowNotifications(false)}
        position="rightt"
        width="480px"
      >
        <DashboardNotification onClose={() => setShowNotifications(false)} onReadChange={setUnreadCount} />
      </SlideInMenu>

      {/* Add Inventory Panel */}
      <SlideInMenu
        isShow={showAddInventory}
        onClose={() => setShowAddInventory(false)}
        position="rightt"
        width="480px"
      >
        <AddInventoryPanel onClose={() => setShowAddInventory(false)} />
      </SlideInMenu>

      {/* New Order Panel */}
      <SlideInMenu
        isShow={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        position="rightt"
        width="500px"
      >
        <NewOrderPanel onClose={() => setShowNewOrder(false)} />
      </SlideInMenu>

      {/* Add Client Panel */}
      <SlideInMenu
        isShow={showAddClient}
        onClose={() => setShowAddClient(false)}
        position="rightt"
        width="480px"
      >
        <AddClientPanel onClose={() => setShowAddClient(false)} />
      </SlideInMenu>

      <div className="main-grid">
        {/* Schedule Section */}
        <div className="schedule-section">
          <div className="section-header">
            <h2 className="section-title">{tx("auto.todaySSchedule_7ed2")}</h2>
            <button
              className="see-more-btn"
              onClick={handleSeeMoreAppointments}
            >
              {tx("auto.seeMore_c510")}
            </button>
          </div>

          {appointmentsLoading ? (
            <div className="schedule-loading">
              <p>{tx("auto.loadingAppointments_f447")}</p>
            </div>
          ) : todaysAppointments.length === 0 ? (
            <div className="no-appointments">
              <div className="no-appointments-content">
                <h3>{tx("auto.noAppointmentsScheduledForToday_cce9")}</h3>
                <p>{tx("auto.yourScheduleIsClearFor_13e3")}</p>
                <button
                  className="schedule-appointment-btn"
                  onClick={handleSeeMoreAppointments}
                >
                  {tx("auto.scheduleAppointment_7a56")}
                </button>
              </div>
            </div>
          ) : (
            /* Stacked Cards Effect */
            <div className="stacked-cards-container">
              {/* Background Cards */}
              {todaysAppointments.length > 1 && (
                <>
                  <div className="bg-card bg-card-1"></div>
                  {todaysAppointments.length > 2 && (
                    <div className="bg-card bg-card-2"></div>
                  )}
                </>
              )}

              {/* Main Card - Show first appointment */}
              <div className="main-schedule-card">
                <div className="schedule-info">
                  <span className="schedule-time">
                    {tl(todaysAppointments[0].time)}
                  </span>
                  <div className="client-info">
                    <Users size={18} className="client-icon" />
                    <span className="client-name">
                      {tl(todaysAppointments[0].clientName)}
                    </span>
                  </div>
                  <span className="service-description">
                    {tl(todaysAppointments[0].title)}
                  </span>
                </div>
                <span className="status-badgee">
                  {tl(formatAppointmentStatus(todaysAppointments[0].status))}
                </span>
              </div>

              {/* Show count if more appointments */}
              {todaysAppointments.length > 1 && (
                <div className="more-appointments-indicator">
                  +{todaysAppointments.length - 1}{" "}{tx("auto.moreAppointment_70c2")}
                  {tl(todaysAppointments.length > 2 ? "s" : "")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">{tx("auto.quickActions_c408")}</h2>
          <div className="quick-actions-grid">
            <QuickActionButton
              icon={FileText}
              label={tx("auto.newOrder_c59c")}
              onClick={toggleNewOrder}
            />
            <QuickActionButton
              icon={UserPlus}
              label={tx("auto.newClient_9029")}
              onClick={toggleAddClient}
            />
            <QuickActionButton
              icon={Plus}
              label={tx("auto.addInventory_224f")}
              onClick={toggleAddInventory}
            />
            <QuickActionButton
              icon={Users}
              label="CRM"
              onClick={handleCRMClick}
            />
          </div>
        </div>
      </div>

      {/* Date Header */}
      <div className="date-header">
        <h2 className="date-title">{tl(getCurrentDate())}</h2>
        <span className="update-time">{tx("auto.updated_f2f8")}{" "}{tl(getLastUpdatedTime())}</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {(() => {
          console.log("📊 Rendering stats cards with data:", {
            statsLoading,
            dashboardStats,
            totalRevenue: dashboardStats?.totalRevenue,
            revenueGrowth: dashboardStats?.revenueGrowth,
            activeClients: dashboardStats?.activeClients,
            newClientsThisMonth: dashboardStats?.newClientsThisMonth,
            pendingOrders: dashboardStats?.pendingOrders,
            ordersThisWeek: dashboardStats?.ordersThisWeek,
            inventoryValue: dashboardStats?.inventoryValue,
            totalInventoryItems: dashboardStats?.totalInventoryItems,
          });
          return null;
        })()}
        <div className="stat-cardd">
          <div className="p1">
            <div className="stat-icon-circle revenue">
              <Users size={24} color="#51a03fff" />
            </div>
            <div className="stat-main-value">
              {(() => {
                const value =
                  statsLoading || !dashboardStats
                    ? ". . . "
                    : formatCurrency(dashboardStats.totalRevenue || 0);
                console.log("💰 Total Revenue display value:", value);
                return value;
              })()}
            </div>
          </div>
          <div className="stat-label">{tx("auto.totalRevenue_f3a8")}{" "}</div>
          <div
            className={`stat-trend ${
              !dashboardStats || (dashboardStats.revenueGrowth || 0) >= 0
                ? "positive"
                : "negative"
            }`}
          >
            {(() => {
              const value =
                statsLoading || !dashboardStats
                  ? "..."
                  : tx("tpl.fromLastMonth_d42b", { v0: formatPercentage(
                      dashboardStats.revenueGrowth || 0
                    ) });
              console.log("📈 Revenue growth display value:", value);
              return value;
            })()}
          </div>
        </div>

        <div className="stat-cardd">
          <div className="p1">
            <div className="stat-icon-circle clients">
              <Users size={24} color="#a03f3fff" />
            </div>
            <div className="stat-main-value">
              {tl(statsLoading || !dashboardStats
                ? "..."
                : dashboardStats.activeClients || 0)}{" "}
              <span className="stat-unitt">{tx("auto.clients_93df")}</span>
            </div>
          </div>
          <div className="stat-label">{tx("auto.activeClients_c182")}</div>
          <div className="stat-trend positive">
            {tl(statsLoading || !dashboardStats
              ? "..."
              : tx("tpl.newThisMonth_107d", { v0: dashboardStats.newClientsThisMonth || 0 }))}
          </div>
        </div>

        <div className="stat-cardd">
          <div className="p1">
            <div className="stat-icon-circle orders">
              <Users size={24} color="#a0963fff" />
            </div>
            <div className="stat-main-value">
              {tl(statsLoading ? "..." : dashboardStats?.pendingOrders || 0)}{" "}
              <span className="stat-unitt">{tx("auto.orders_9658")}</span>
            </div>
          </div>
          <div className="stat-label">{tx("auto.pendingOrders_2a94")}</div>
          <div className="stat-trend warning">
            {tl(statsLoading
              ? "..."
              : tx("tpl.dueThisWeek_4d0d", { v0: dashboardStats?.ordersThisWeek || 0 }))}
          </div>
        </div>

        <div className="stat-cardd">
          <div className="p1">
            <div className="stat-icon-circle inventory">
              <Users size={24} color="#413fa0ff" />
            </div>
            <div className="stat-main-value">
              {(() => {
                const value = statsLoading
                  ? "Loading..."
                  : formatCurrency(dashboardStats?.inventoryValue || 0);
                console.log("📋 Inventory value display value:", value);
                return value;
              })()}
            </div>
          </div>
          <div className="stat-label">{tx("auto.inventoryValue_d96f")}</div>
          <div className="stat-trend neutral">
            {(() => {
              const value = statsLoading
                ? "..."
                : tx("tpl.itemsInStock_af6d", { v0: dashboardStats?.totalInventoryItems || 0 });
              console.log("📋 Inventory items display value:", value);
              return value;
            })()}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Bar Chart */}
        <div className="bar-chart-container">
          <div className="chart-header">
            <div className="chart-title-section">
              <h3 className="chart-title">{tx("auto.overallSales_11b6")}</h3>
              <div className="chart-subtitle">
                <span className="trend-indicator">
                  {(() => {
                    const value = statsLoading
                      ? "..."
                      : dashboardStats?.revenueGrowth >= 0
                      ? "↑"
                      : "↓";
                    console.log("📊 Overall Sales trend indicator:", value);
                    return value;
                  })()}{" "}
                  {(() => {
                    const value = statsLoading
                      ? "0"
                      : Math.abs(dashboardStats?.revenueGrowth || 0).toFixed(1);
                    console.log("📊 Overall Sales percentage:", value);
                    return value;
                  })()}
                  %
                </span>
                <span className="trend-text">{tx("auto.vsLastYear_b517")}</span>
              </div>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <div className="legend-dot legend-last-year"></div>{" "}{tx("auto.lastYear_ab9f")}
              </span>
              <span className="legend-item">
                <div className="legend-dot legend-current-year"></div>{" "}{tx("auto.runningYear_d3d2")}
              </span>
            </div>
          </div>
          <div className="chart-container">
            {(() => {
              console.log("📊 Rendering SalesChart with data:", salesChartData);
              return <SalesChart data={salesChartData} />;
            })()}
          </div>
        </div>

        {/* Circular Stats */}
        <div className="circular-stats-grid">
          {(() => {
            console.log("🔵 Rendering circular stats with data:", {
              statsLoading,
              dashboardStats,
              completionRate: dashboardStats?.completionRate,
              clientSatisfaction: dashboardStats?.clientSatisfaction,
              averageOrderValue: dashboardStats?.averageOrderValue,
            });
            return null;
          })()}
          <div className="circular-stat-card">
            <CircularStat
              percentage={(() => {
                let value = 0;
                if (!statsLoading && dashboardStats) {
                  const rate = dashboardStats.completionRate;
                  if (
                    rate !== undefined &&
                    rate !== null &&
                    !isNaN(rate) &&
                    isFinite(rate)
                  ) {
                    value = Math.round(rate);
                  }
                }
                console.log("🔵 Order Completion Rate percentage:", {
                  statsLoading,
                  dashboardStats: !!dashboardStats,
                  rawRate: dashboardStats?.completionRate,
                  finalValue: value,
                });
                return value;
              })()}
              label={tx("auto.orderCompletionRate_dfb5")}
              color="#0d9488"
              size={140}
            />
          </div>
          <div className="circular-stat-card">
            <CircularStat
              percentage={(() => {
                let value = 0;
                if (!statsLoading && dashboardStats) {
                  const satisfaction = dashboardStats.clientSatisfaction;
                  if (
                    satisfaction !== undefined &&
                    satisfaction !== null &&
                    !isNaN(satisfaction) &&
                    isFinite(satisfaction)
                  ) {
                    value = Math.round(satisfaction);
                  }
                }
                console.log("🔵 Client Satisfaction percentage:", {
                  statsLoading,
                  dashboardStats: !!dashboardStats,
                  rawSatisfaction: dashboardStats?.clientSatisfaction,
                  finalValue: value,
                });
                return value;
              })()}
              label={tx("auto.clientSatisfaction_864f")}
              color="#0d9488"
              size={140}
            />
          </div>
          <div className="circular-stat-card">
            <CircularStat
              percentage={100}
              label={tx("auto.aveOrderValue_a25e")}
              subLabel={(() => {
                const value =
                  statsLoading || !dashboardStats
                    ? "₦0"
                    : formatCurrency(dashboardStats.averageOrderValue || 0);
                console.log("🔵 Average Order Value subLabel:", value);
                return value;
              })()}
              color="#0d9488"
              size={140}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components for Dashboard

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    <div className="action-icon-container">
      <Icon size={24} />
    </div>
    <span className="action-label">{tl(label)}</span>
  </button>
);


export default DashboardOverview;
