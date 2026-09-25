import { useState, useEffect, useCallback } from "react";
import { useNewAuth } from "../contexts/NewAuthContext";
import { useSubscription } from "./use-subscription";
import { ADMIN_LIMITS } from "../constants/subscription";

const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  return fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

export function useAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const { planType } = useSubscription();
  const { user } = useNewAuth();

  const canAddMoreAdmins = (currentCount) =>
    currentCount < (ADMIN_LIMITS[planType] || 0);

  const getAdminLimit = () => ADMIN_LIMITS[planType] || 0;

  const loadAdmins = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch("/api/sub-admin/get");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const createAdmin = async (adminData) => {
    if (!canAddMoreAdmins(admins.length)) {
      throw new Error(
        `You have reached the limit of ${getAdminLimit()} admins for your ${planType} plan.`
      );
    }

    setOperationLoading(true);
    try {
      const res = await apiFetch("/api/sub-admin/create", {
        method: "POST",
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phoneNumber || "",
          role: adminData.role || "SubAdmin",
          permissions: adminData.permissions || {},
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create admin");

      setAdmins((prev) => [{ ...data.data, password: data.password }, ...prev]);
      return { success: true, password: data.password, admin: data.data };
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const updateAdmin = async (adminEmail, adminData) => {
    try {
      const res = await apiFetch("/api/sub-admin/edit", {
        method: "PUT",
        body: JSON.stringify({ email: adminEmail, ...adminData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update admin");
      setAdmins((prev) =>
        prev.map((a) => (a.email === adminEmail ? { ...a, ...adminData } : a))
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  };

  const deleteAdmin = async (adminEmail) => {
    setOperationLoading(true);
    try {
      const adminToDelete = admins.find((a) => a.email === adminEmail);
      if (!adminToDelete) throw new Error("Admin not found");

      const res = await apiFetch("/api/sub-admin/delete", {
        method: "DELETE",
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete admin");

      setAdmins((prev) => prev.filter((a) => a.email !== adminEmail));
      return { success: true, deletedAdmin: adminToDelete };
    } catch (error) {
      console.error("Error deleting admin:", error);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleAdminStatus = async (adminEmail) => {
    const admin = admins.find((a) => a.email === adminEmail);
    if (!admin) return { success: false };
    const newStatus = admin.status === "active" ? "inactive" : "active";
    try {
      await updateAdmin(adminEmail, { status: newStatus });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (user?.email) loadAdmins();
    else setLoading(false);
  }, [user?.email, loadAdmins]);

  return {
    admins,
    loading,
    operationLoading,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleAdminStatus,
    refreshAdmins: loadAdmins,
    canAddMoreAdmins: () => canAddMoreAdmins(admins.length),
    adminLimit: getAdminLimit(),
  };
}
