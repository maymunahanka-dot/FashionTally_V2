import { Routes, Route } from "react-router-dom";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Sidebar from "../../components/Sidebar";
import { TrialBanner } from "../../components/TrialBanner";
import { AdminPermissionGate } from "../../components/AdminPermissionGate/AdminPermissionGate";
import DashboardOverview from "./pages/dashboardOverview/DashboardOverview";
import ClientsManagement from "./pages/clientManagment/ClientsManagement";
import Inventory from "./pages/inventory/Inventory";
import Designs from "./pages/design/Designs";
import OrderManagement from "./pages/ordermanagment/OrderManagement";
import Invoice from "./pages/invoice/Invoice";
import Appointments from "./pages/apointments/Appointments";
import Finances from "./pages/finance/Finances";
import CRM from "./pages/crm/CRM";
import Settings from "./pages/settings/Settings";
import TicketingWidget from "../../components/TicketingWidget/TicketingWidget";
import { useNotificationSetup } from "../../hooks/useNotificationSetup";
import "./Dashboard.css";

export const Dashboard = () => {
  const { user } = useNewAuth();
  const { isDark, actualTheme } = useTheme();

  // Listen for foreground FCM messages and show native notifications
  useNotificationSetup();

  // Use the new auth system
  const currentUser = user;

  if (!currentUser) {
    return (
      <div className="dashboard-loading">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main" data-theme={actualTheme}>
        <TrialBanner />
        <Routes>
          <Route
            index
            element={
              <AdminPermissionGate requiredFeature="Dashboard Analytics">
                <DashboardOverview />
              </AdminPermissionGate>
            }
          />
          <Route
            path="clients"
            element={
              <AdminPermissionGate requiredFeature="Client Management">
                <ClientsManagement />
              </AdminPermissionGate>
            }
          />
          <Route
            path="inventory"
            element={
              <AdminPermissionGate requiredFeature="Inventory Tool">
                <Inventory />
              </AdminPermissionGate>
            }
          />
          <Route
            path="designs"
            element={
              <AdminPermissionGate requiredFeature="Design Management">
                <Designs />
              </AdminPermissionGate>
            }
          />
          <Route
            path="orders"
            element={
              <AdminPermissionGate requiredFeature="Custom Orders">
                <OrderManagement />
              </AdminPermissionGate>
            }
          />
          <Route
            path="invoice"
            element={
              <AdminPermissionGate requiredFeature="Invoicing">
                <Invoice />
              </AdminPermissionGate>
            }
          />
          <Route
            path="appointments"
            element={
              <AdminPermissionGate requiredFeature="Appointment Scheduling">
                <Appointments />
              </AdminPermissionGate>
            }
          />
          <Route
            path="finances"
            element={
              <AdminPermissionGate requiredFeature="Financial Reports">
                <Finances />
              </AdminPermissionGate>
            }
          />
          <Route
            path="crm"
            element={
              <AdminPermissionGate requiredFeature="CRM Tools">
                <CRM />
              </AdminPermissionGate>
            }
          />
          <Route
            path="settings"
            element={
              <AdminPermissionGate requiredFeature="Settings Management">
                <Settings />
              </AdminPermissionGate>
            }
          />
        </Routes>
      </main>
      <TicketingWidget />
    </div>
  );
};
