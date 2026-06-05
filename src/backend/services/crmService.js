import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase.config";

// Collection references
const feedbackCollection = collection(db, "feedback");
const loyaltyMembersCollection = collection(db, "loyaltyMembers");
const designsCollection = collection(db, "fashiontally_designs");
const appointmentsCollection = collection(db, "fashiontally_appointments");

/**
 * Get all feedback for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of feedback objects
 */
export const getFeedback = async (userEmail) => {
  try {
    if (!userEmail) {
      console.warn("No user email provided to getFeedback");
      return [];
    }

    const q = query(feedbackCollection, where("tailorId", "==", userEmail));

    const snapshot = await getDocs(q);
    const feedbackData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt in JavaScript instead of Firestore
    feedbackData.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // Descending order (newest first)
    });

    return feedbackData;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
};

/**
 * Add new feedback
 * @param {Object} feedbackData - Feedback data object
 * @param {string} userEmail - Current user's email
 * @returns {Promise<string>} Document ID of created feedback
 */
export const addFeedback = async (feedbackData, userEmail) => {
  try {
    if (!userEmail) {
      throw new Error("User email is required");
    }

    const feedbackWithMetadata = {
      ...feedbackData,
      tailorId: userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(feedbackCollection, feedbackWithMetadata);
    console.log("Feedback added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
};
/**
 * Reply to feedback
 * @param {string} feedbackId - ID of the feedback to reply to
 * @param {string} reply - Reply text
 * @returns {Promise<void>}
 */
export const replyToFeedback = async (feedbackId, reply) => {
  try {
    const feedbackRef = doc(db, "feedback", feedbackId);
    await updateDoc(feedbackRef, {
      reply,
      repliedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("Reply added to feedback:", feedbackId);
  } catch (error) {
    console.error("Error replying to feedback:", error);
    throw error;
  }
};

/**
 * Update feedback reply
 * @param {string} feedbackId - ID of the feedback to update
 * @param {string} reply - Updated reply text
 * @returns {Promise<void>}
 */
export const updateFeedbackReply = async (feedbackId, reply) => {
  try {
    const feedbackRef = doc(db, "feedback", feedbackId);
    await updateDoc(feedbackRef, {
      reply,
      updatedAt: Timestamp.now(),
    });
    console.log("Feedback reply updated:", feedbackId);
  } catch (error) {
    console.error("Error updating feedback reply:", error);
    throw error;
  }
};

/**
 * Delete feedback
 * @param {string} feedbackId - ID of the feedback to delete
 * @returns {Promise<void>}
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    const feedbackRef = doc(db, "feedback", feedbackId);
    await deleteDoc(feedbackRef);
    console.log("Feedback deleted:", feedbackId);
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
};

/**
 * Update feedback
 * @param {string} feedbackId - ID of the feedback to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const feedbackRef = doc(db, "feedback", feedbackId);
    await updateDoc(feedbackRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    console.log("Feedback updated:", feedbackId);
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
};

/**
 * Get clients for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of client objects
 */
export const getClients = async (userEmail) => {
  console.log("👥 getClients called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getClients");
      return [];
    }

    const q = query(
      collection(db, "fashiontally_clients"),
      where("userEmail", "==", userEmail)
    );

    console.log("👥 Executing clients query...");
    const snapshot = await getDocs(q);
    const clientsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Clients fetched:", clientsData.length, clientsData);
    return clientsData;
  } catch (error) {
    console.error("❌ Error fetching clients:", error);
    return [];
  }
};

/**
 * Get orders for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrders = async (userEmail) => {
  console.log("📦 getOrders called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getOrders");
      return [];
    }

    // Orders are now stored in fashiontally_designs collection
    const q = query(
      collection(db, "fashiontally_designs"),
      where("userEmail", "==", userEmail)
    );

    console.log(
      "📦 Executing orders query on fashiontally_designs collection..."
    );
    const snapshot = await getDocs(q);
    const ordersData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "✅ Orders fetched from fashiontally_designs:",
      ordersData.length,
      ordersData
    );
    return ordersData;
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return [];
  }
};

/**
 * Get invoices for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of invoice objects
 */
export const getInvoices = async (userEmail) => {
  console.log("🧾 getInvoices called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getInvoices");
      return [];
    }

    const q = query(
      collection(db, "fashiontally_invoices"),
      where("userEmail", "==", userEmail)
    );

    console.log("🧾 Executing invoices query...");
    const snapshot = await getDocs(q);
    const invoicesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "invoiceeeeeeeeeeeeeeee 💰 Raw invoices fetched:",
      invoicesData.length
    );

    // Log each invoice with detailed info
    invoicesData.forEach((invoice, index) => {
      console.log(`invoiceeeeeeeeeeeeeeee 💰 Invoice ${index + 1}:`, {
        id: invoice.id,
        totalAmount: invoice.totalAmount,
        total: invoice.total,
        amount: invoice.amount,
        grandTotal: invoice.grandTotal,
        finalAmount: invoice.finalAmount,
        subtotal: invoice.subtotal,
        createdAt: invoice.createdAt,
        userEmail: invoice.userEmail,
        allFields: Object.keys(invoice),
        fullData: invoice,
      });
    });

    console.log("✅ Invoices fetched:", invoicesData.length, invoicesData);
    return invoicesData;
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return [];
  }
};
export const calculateFeedbackStats = (feedbackArray) => {
  if (!feedbackArray || feedbackArray.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      responseRate: 0,
    };
  }

  const totalReviews = feedbackArray.length;
  const totalRating = feedbackArray.reduce(
    (sum, feedback) => sum + (feedback.rating || 0),
    0
  );
  const averageRating = totalRating / totalReviews;

  const ratingDistribution = feedbackArray.reduce(
    (dist, feedback) => {
      const rating = feedback.rating || 0;
      if (rating >= 1 && rating <= 5) {
        dist[rating] = (dist[rating] || 0) + 1;
      }
      return dist;
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  );

  const repliedCount = feedbackArray.filter(
    (feedback) => feedback.reply && feedback.reply.trim()
  ).length;
  const responseRate = (repliedCount / totalReviews) * 100;

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution,
    responseRate: Math.round(responseRate),
  };
};

// ============ LOYALTY MEMBERS FUNCTIONS ============

/**
 * Get all loyalty members for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of loyalty member objects
 */
export const getLoyaltyMembers = async (userEmail) => {
  try {
    if (!userEmail) {
      console.warn("No user email provided to getLoyaltyMembers");
      return [];
    }

    const q = query(
      loyaltyMembersCollection,
      where("tailorId", "==", userEmail)
    );

    const snapshot = await getDocs(q);
    const membersData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by points in JavaScript (descending order)
    membersData.sort((a, b) => (b.points || 0) - (a.points || 0));

    return membersData;
  } catch (error) {
    console.error("Error fetching loyalty members:", error);
    return [];
  }
};

/**
 * Add new loyalty member
 * @param {Object} memberData - Member data object
 * @param {string} userEmail - Current user's email
 * @returns {Promise<string>} Document ID of created member
 */
export const addLoyaltyMember = async (memberData, userEmail) => {
  try {
    if (!userEmail) {
      throw new Error("User email is required");
    }

    const memberWithMetadata = {
      ...memberData,
      tailorId: userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(loyaltyMembersCollection, memberWithMetadata);
    console.log("Loyalty member added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding loyalty member:", error);
    throw error;
  }
};

/**
 * Update loyalty member
 * @param {string} memberId - ID of the member to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateLoyaltyMember = async (memberId, updateData) => {
  try {
    const memberRef = doc(db, "loyaltyMembers", memberId);
    await updateDoc(memberRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    console.log("Loyalty member updated:", memberId);
  } catch (error) {
    console.error("Error updating loyalty member:", error);
    throw error;
  }
};

/**
 * Delete loyalty member
 * @param {string} memberId - ID of the member to delete
 * @returns {Promise<void>}
 */
export const deleteLoyaltyMember = async (memberId) => {
  try {
    const memberRef = doc(db, "loyaltyMembers", memberId);
    await deleteDoc(memberRef);
    console.log("Loyalty member deleted:", memberId);
  } catch (error) {
    console.error("Error deleting loyalty member:", error);
    throw error;
  }
};

// ============ LOYALTY STATS FUNCTIONS ============

/**
 * Calculate loyalty statistics
 * @param {Array} membersArray - Array of loyalty members
 * @returns {Object} Loyalty statistics
 */
export const calculateLoyaltyStats = (membersArray) => {
  if (!membersArray || membersArray.length === 0) {
    return {
      totalMembers: 0,
      totalPoints: 0,
      totalSpent: 0,
      averagePoints: 0,
      levelCounts: {
        Bronze: 0,
        Silver: 0,
        Gold: 0,
        Platinum: 0,
      },
    };
  }

  const totalMembers = membersArray.length;
  const totalPoints = membersArray.reduce(
    (sum, member) => sum + (member.points || 0),
    0
  );
  const totalSpent = membersArray.reduce(
    (sum, member) => sum + (member.totalSpent || 0),
    0
  );
  const averagePoints =
    totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;

  // Count by level
  const levelCounts = {
    Bronze: 0,
    Silver: 0,
    Gold: 0,
    Platinum: 0,
  };

  membersArray.forEach((member) => {
    if (member.level && levelCounts.hasOwnProperty(member.level)) {
      levelCounts[member.level]++;
    }
  });

  return {
    totalMembers,
    totalPoints,
    totalSpent,
    averagePoints,
    levelCounts,
  };
};

// ============ DESIGNS FUNCTIONS ============

/**
 * Get all designs for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of design objects
 */
export const getDesigns = async (userEmail) => {
  try {
    if (!userEmail) {
      console.warn("No user email provided to getDesigns");
      return [];
    }

    console.log("🎨 Fetching designs for user:", userEmail);

    const q = query(designsCollection, where("userEmail", "==", userEmail));

    const snapshot = await getDocs(q);
    const designsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt in JavaScript (descending order)
    designsData.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // Newest first
    });

    console.log(`✅ Fetched ${designsData.length} designs`);
    console.log(`✅ Fetchedddd `, designsData);

    // Log each design with client information
    designsData.forEach((design, index) => {
      console.log(`\n📋 Design ${index + 1}:`, {
        id: design.id,
        name: design.name,
        category: design.category,
        price: design.price,
        clientId: design.clientId || "No client linked",
        clientName: design.clientName || "No client name",
        hasImage:
          !!design.imageUrl || (design.images && design.images.length > 0),
        createdAt: design.createdAt?.toDate?.() || "N/A",
      });
    });

    return designsData;
  } catch (error) {
    console.error("❌ Error fetching designs:", error);
    return [];
  }
};

/**
 * Add new design
 * @param {Object} designData - Design data object
 * @param {string} userEmail - Current user's email
 * @returns {Promise<string>} Document ID of created design
 */
export const addDesign = async (designData, userEmail) => {
  try {
    if (!userEmail) {
      throw new Error("User email is required");
    }

    const designWithMetadata = {
      ...designData,
      userEmail: userEmail,
      tailorId: userEmail, // Keep for backward compatibility
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("➕ Adding new design:", {
      name: designWithMetadata.name,
      category: designWithMetadata.category,
      price: designWithMetadata.price,
      clientId: designWithMetadata.clientId || "No client",
      clientName: designWithMetadata.clientName || "No client name",
      userEmail: designWithMetadata.userEmail,
    });

    const docRef = await addDoc(designsCollection, designWithMetadata);
    console.log("✅ Design added successfully with ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding design:", error);
    throw error;
  }
};

/**
 * Update design
 * @param {string} designId - ID of the design to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateDesign = async (designId, updateData) => {
  try {
    console.log("✏️ Updating design:", designId, {
      name: updateData.name,
      category: updateData.category,
      price: updateData.price,
      clientId: updateData.clientId || "No client",
      clientName: updateData.clientName || "No client name",
    });

    const designRef = doc(db, "fashiontally_designs", designId);
    await updateDoc(designRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Design updated successfully:", designId);
  } catch (error) {
    console.error("❌ Error updating design:", error);
    throw error;
  }
};

/**
 * Delete design
 * @param {string} designId - ID of the design to delete
 * @returns {Promise<void>}
 */
export const deleteDesign = async (designId) => {
  try {
    const designRef = doc(db, "fashiontally_designs", designId);
    await deleteDoc(designRef);
    console.log("Design deleted:", designId);
  } catch (error) {
    console.error("Error deleting design:", error);
    throw error;
  }
};

/**
 * Get designs for a specific client
 * @param {string} clientId - Client ID to filter designs
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of design objects for the client
 */
export const getDesignsByClientId = async (clientId, userEmail) => {
  try {
    if (!clientId || !userEmail) {
      console.warn("Client ID and user email are required");
      return [];
    }

    console.log("🎨 Fetching designs for client:", clientId);

    const q = query(
      designsCollection,
      where("userEmail", "==", userEmail),
      where("clientId", "==", clientId)
    );

    const snapshot = await getDocs(q);
    const designsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt (newest first)
    designsData.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    console.log(
      `✅ Found ${designsData.length} designs for client ${clientId}`
    );

    return designsData;
  } catch (error) {
    console.error("❌ Error fetching designs by client:", error);
    return [];
  }
};

// ============ APPOINTMENTS FUNCTIONS ============

/**
 * Get today's appointments for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of today's appointment objects
 */
export const getTodaysAppointments = async (userEmail) => {
  try {
    if (!userEmail) {
      console.warn("No user email provided to getTodaysAppointments");
      return [];
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const q = query(
      appointmentsCollection,
      where("userEmail", "==", userEmail),
      where("date", "==", todayString)
    );

    const snapshot = await getDocs(q);
    const appointmentsData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.purpose || data.appointmentType || "Appointment",
        clientName: data.clientName || "Unknown Client",
        date: data.date || "",
        time: data.time || "",
        location: data.location || "Shop",
        status: data.status || "Scheduled",
        duration: data.duration || "1hr",
        notes: data.notes || "",
        ...data,
      };
    });

    // Sort by time
    appointmentsData.sort((a, b) => {
      const timeA = convertTimeToMinutes(a.time);
      const timeB = convertTimeToMinutes(b.time);
      return timeA - timeB;
    });

    return appointmentsData;
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return [];
  }
};

/**
 * Convert time string to minutes for sorting
 * @param {string} timeString - Time in format "09:00 AM" or "2:30 PM"
 * @returns {number} Minutes since midnight
 */
const convertTimeToMinutes = (timeString) => {
  if (!timeString) return 0;

  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let totalMinutes = (hours % 12) * 60 + minutes;
  if (period === "PM" && hours !== 12) {
    totalMinutes += 12 * 60;
  } else if (period === "AM" && hours === 12) {
    totalMinutes = minutes;
  }

  return totalMinutes;
};

// ============ DASHBOARD STATS FUNCTIONS ============

/**
 * Get comprehensive dashboard statistics
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Object>} Dashboard statistics object
 */
export const getDashboardStats = async (userEmail) => {
  console.log("🔍 getDashboardStats called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getDashboardStats");
      return getDefaultStats();
    }

    console.log("📊 Fetching dashboard data in parallel...");

    // Get all data in parallel
    const [clients, orders, invoices, inventory, appointments] =
      await Promise.all([
        getClients(userEmail),
        getOrders(userEmail),
        getInvoices(userEmail),
        getInventory(userEmail),
        getAppointments(userEmail),
      ]);

    console.log("📈 Raw data fetched:");
    console.log("  - Clients:", clients.length, clients);
    console.log("  - Orders:", orders.length, orders);
    console.log("  - Invoices:", invoices.length, invoices);
    console.log("  - Inventory:", inventory.length, inventory);
    console.log("  - Appointments:", appointments.length, appointments);

    // Calculate stats
    const stats = await calculateDashboardMetrics(
      clients,
      orders,
      invoices,
      inventory,
      appointments,
      userEmail
    );

    console.log("✅ Calculated dashboard stats:", stats);
    return stats;
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return getDefaultStats();
  }
};

/**
 * Get inventory for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of inventory objects
 */
export const getInventory = async (userEmail) => {
  console.log("📋 getInventory called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getInventory");
      return [];
    }

    const q = query(
      collection(db, "fashiontally_inventory"),
      where("userEmail", "==", userEmail)
    );

    console.log("📋 Executing inventory query...");
    const snapshot = await getDocs(q);
    const inventoryData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Inventory fetched:", inventoryData.length, inventoryData);
    return inventoryData;
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    return [];
  }
};

/**
 * Get all appointments for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of appointment objects
 */
export const getAppointments = async (userEmail) => {
  console.log("📅 getAppointments called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getAppointments");
      return [];
    }

    const q = query(
      appointmentsCollection,
      where("userEmail", "==", userEmail)
    );

    console.log("📅 Executing appointments query...");
    const snapshot = await getDocs(q);
    const appointmentsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "✅ Appointments fetched:",
      appointmentsData.length,
      appointmentsData
    );
    return appointmentsData;
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return [];
  }
};

/**
 * Calculate dashboard metrics from raw data
 * @param {Array} clients - Array of client objects
 * @param {Array} orders - Array of order objects
 * @param {Array} invoices - Array of invoice objects
 * @param {Array} inventory - Array of inventory objects
 * @param {Array} appointments - Array of appointment objects
 * @param {string} userEmail - Current user's email (for feedback data)
 * @returns {Object} Calculated metrics
 */
const calculateDashboardMetrics = async (
  clients,
  orders,
  invoices,
  inventory,
  appointments,
  userEmail
) => {
  console.log("🧮 calculateDashboardMetrics started");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  console.log("📅 Date calculations:", {
    currentMonth,
    currentYear,
    lastMonth,
    lastMonthYear,
    currentDate: now,
    currentMonthName: now.toLocaleString("default", { month: "long" }),
    currentYearFull: currentYear,
  });

  console.log("invoiceeeeeeeeeeeeeeee 💰 Date filter criteria:", {
    lookingForMonth: currentMonth,
    lookingForYear: currentYear,
    monthName: now.toLocaleString("default", { month: "long" }),
    fullDate: now.toDateString(),
  });

  // Revenue calculations
  console.log("💰 Calculating revenue...");
  console.log(
    "invoiceeeeeeeeeeeeeeee 💰 Starting revenue calculation with",
    invoices.length,
    "total invoices"
  );

  // Calculate current month revenue (this will be the "Total Revenue")
  const currentMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = invoice.createdAt?.toDate
      ? invoice.createdAt.toDate()
      : new Date(invoice.createdAt);
    const isCurrentMonth =
      invoiceDate.getMonth() === currentMonth &&
      invoiceDate.getFullYear() === currentYear;

    console.log(`invoiceeeeeeeeeeeeeeee 💰 Checking invoice ${invoice.id}:`, {
      invoiceDate: invoiceDate,
      invoiceMonth: invoiceDate.getMonth(),
      invoiceYear: invoiceDate.getFullYear(),
      currentMonth: currentMonth,
      currentYear: currentYear,
      isCurrentMonth: isCurrentMonth,
      totalAmount: invoice.totalAmount,
    });

    if (isCurrentMonth) {
      console.log(
        `invoiceeeeeeeeeeeeeeee 💰 ✅ INCLUDED - Current month invoice: ${invoice.id}, date: ${invoiceDate}, amount: ${invoice.totalAmount}`
      );
    } else {
      console.log(
        `invoiceeeeeeeeeeeeeeee 💰 ❌ EXCLUDED - Not current month: ${invoice.id}, date: ${invoiceDate}, amount: ${invoice.totalAmount}`
      );
    }
    return isCurrentMonth;
  });

  console.log(
    `invoiceeeeeeeeeeeeeeee 💰 Filtered to ${currentMonthInvoices.length} current month invoices`
  );

  const totalRevenue = currentMonthInvoices.reduce((sum, invoice) => {
    // Try different possible field names for the amount
    const amount =
      parseFloat(invoice.totalAmount) ||
      parseFloat(invoice.total) ||
      parseFloat(invoice.amount) ||
      parseFloat(invoice.grandTotal) ||
      parseFloat(invoice.finalAmount) ||
      parseFloat(invoice.subtotal) ||
      0;

    console.log(`invoiceeeeeeeeeeeeeeee 💰 Adding invoice ${invoice.id}:`, {
      totalAmount: invoice.totalAmount,
      total: invoice.total,
      amount: invoice.amount,
      grandTotal: invoice.grandTotal,
      finalAmount: invoice.finalAmount,
      subtotal: invoice.subtotal,
      calculatedAmount: amount,
      runningTotal: sum + amount,
    });

    return sum + amount;
  }, 0);
  console.log(
    "invoiceeeeeeeeeeeeeeee 💰 FINAL Total Revenue (Current Month):",
    totalRevenue
  );

  // For growth calculation, we use the same current month revenue
  const currentMonthRevenue = totalRevenue;

  const lastMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = invoice.createdAt?.toDate
      ? invoice.createdAt.toDate()
      : new Date(invoice.createdAt);
    const isLastMonth =
      invoiceDate.getMonth() === lastMonth &&
      invoiceDate.getFullYear() === lastMonthYear;
    if (isLastMonth) {
      console.log(
        `  Last month invoice: ${invoice.id}, date: ${invoiceDate}, amount: ${invoice.totalAmount}`
      );
    }
    return isLastMonth;
  });

  const lastMonthRevenue = lastMonthInvoices.reduce(
    (sum, invoice) => sum + (parseFloat(invoice.totalAmount) || 0),
    0
  );

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  console.log("📊 Revenue calculations:", {
    currentMonthRevenue,
    lastMonthRevenue,
    revenueGrowth,
  });

  // Client calculations
  console.log("👥 Calculating clients...");
  const activeClients = clients.length;
  const newClientsThisMonth = clients.filter((client) => {
    const clientDate = client.createdAt?.toDate
      ? client.createdAt.toDate()
      : new Date(client.createdAt);
    const isThisMonth =
      clientDate.getMonth() === currentMonth &&
      clientDate.getFullYear() === currentYear;
    if (isThisMonth) {
      console.log(`  New client this month: ${client.name || client.id}`);
    }
    return isThisMonth;
  }).length;

  console.log("👥 Client calculations:", {
    activeClients,
    newClientsThisMonth,
  });

  // Order calculations
  console.log("📦 Calculating orders...");
  const pendingOrders = orders.filter((order) => {
    const isPending =
      order.status === "Active" ||
      order.status === "In Progress" ||
      order.status === "Pending";
    if (isPending) {
      console.log(`  Pending order: ${order.id}, status: ${order.status}`);
    }
    return isPending;
  }).length;

  const ordersThisWeek = orders.filter((order) => {
    const orderDate = order.createdAt?.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const isThisWeek = orderDate >= weekAgo;
    if (isThisWeek) {
      console.log(`  Order this week: ${order.id}, date: ${orderDate}`);
    }
    return isThisWeek;
  }).length;

  console.log("📦 Order calculations:", {
    pendingOrders,
    ordersThisWeek,
  });

  // Inventory calculations
  console.log("📋 Calculating inventory...");
  const inventoryValue = inventory.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const itemValue = price * quantity;
    console.log(
      `  Inventory item: ${
        item.name || item.id
      }, price: ₦${price}, qty: ${quantity}, value: ₦${itemValue}`
    );
    return sum + itemValue;
  }, 0);

  const totalInventoryItems = inventory.reduce((sum, item) => {
    const quantity = parseInt(item.quantity) || 0;
    return sum + quantity;
  }, 0);

  console.log("📋 Inventory calculations:", {
    inventoryValue,
    totalInventoryItems,
  });

  // Order completion calculations (instead of appointments)
  console.log("📦 Calculating order completion...");
  console.log("📦 Total orders received:", orders.length, orders);

  const completedOrders = orders.filter((order) => {
    // Check multiple possible status field names and values
    const status =
      order.status || order.orderStatus || order.state || order.condition;

    // Based on OrderManagement.jsx: "Archived" = "Completed", "Active" = "In Progress"
    const isCompleted =
      status === "Archived" || // Database value for completed orders
      status === "Completed" ||
      status === "completed" ||
      status === "Complete" ||
      status === "complete" ||
      status === "Done" ||
      status === "done" ||
      status === "Finished" ||
      status === "finished" ||
      status === "Delivered" ||
      status === "delivered";

    console.log(`📦 Order ${order.id}:`, {
      status: order.status,
      orderStatus: order.orderStatus,
      state: order.state,
      condition: order.condition,
      finalStatus: status,
      isCompleted: isCompleted,
      allFields: Object.keys(order),
      name: order.name,
      category: order.category,
      fullOrder: order,
    });

    if (isCompleted) {
      console.log(
        `📦 ✅ Completed order: ${order.id}, status: ${status}, name: ${order.name}`
      );
    } else {
      console.log(
        `📦 ❌ Not completed order: ${order.id}, status: ${status}, name: ${order.name}`
      );
    }
    return isCompleted;
  }).length;

  const totalOrders = orders.length;
  let completionRate = 0;

  if (totalOrders > 0) {
    completionRate = (completedOrders / totalOrders) * 100;
  } else {
    console.log("📦 No orders found, setting completion rate to 0");
  }

  // Ensure completion rate is a valid number
  if (isNaN(completionRate) || !isFinite(completionRate)) {
    console.log("📦 Invalid completion rate calculated, defaulting to 0");
    completionRate = 0;
  }

  console.log("📦 Order completion calculations:", {
    completedOrders,
    totalOrders,
    completionRate,
    completionRateRounded: Math.round(completionRate),
    isValidNumber: !isNaN(completionRate) && isFinite(completionRate),
  });

  // Client satisfaction calculation based on feedback ratings
  console.log("😊 Calculating client satisfaction from feedback...");
  let clientSatisfaction = 0;

  try {
    // Get feedback data for the user
    const feedbackData = await getFeedback(userEmail);
    console.log(
      "😊 Feedback data retrieved:",
      feedbackData.length,
      feedbackData
    );

    if (feedbackData && feedbackData.length > 0) {
      // Calculate average rating from feedback
      const totalRating = feedbackData.reduce((sum, feedback) => {
        const rating = feedback.rating || 0;
        console.log(
          `😊 Feedback ${feedback.id}: rating=${rating}, client=${feedback.clientName}`
        );
        return sum + rating;
      }, 0);

      const averageRating = totalRating / feedbackData.length;
      // Convert 5-star rating to percentage (5 stars = 100%)
      clientSatisfaction = (averageRating / 5) * 100;

      console.log("😊 Client satisfaction calculation:", {
        totalFeedback: feedbackData.length,
        totalRating: totalRating,
        averageRating: averageRating,
        clientSatisfactionPercentage: clientSatisfaction,
      });
    } else {
      console.log(
        "😊 No feedback data found, using default satisfaction of 0%"
      );
      clientSatisfaction = 0;
    }
  } catch (error) {
    console.error("😊 Error calculating client satisfaction:", error);
    clientSatisfaction = 0; // Default to 0 if there's an error
  }

  // Average order value - calculate from actual order prices
  console.log("💰 Calculating average order value from order data...");
  let averageOrderValue = 0;

  if (orders.length > 0) {
    // Calculate total value from order prices (not invoices)
    const totalOrderValue = orders.reduce((sum, order) => {
      // Try different possible price field names
      const orderPrice =
        parseFloat(order.price) ||
        parseFloat(order.totalPrice) ||
        parseFloat(order.amount) ||
        parseFloat(order.cost) ||
        parseFloat(order.value) ||
        0;

      console.log(`💰 Order ${order.id}:`, {
        name: order.name,
        price: order.price,
        totalPrice: order.totalPrice,
        amount: order.amount,
        cost: order.cost,
        value: order.value,
        calculatedPrice: orderPrice,
      });

      return sum + orderPrice;
    }, 0);

    averageOrderValue = totalOrderValue / orders.length;

    console.log("💰 Average order value calculation:", {
      totalOrders: orders.length,
      totalOrderValue: totalOrderValue,
      averageOrderValue: averageOrderValue,
    });
  } else {
    console.log("💰 No orders found, average order value = 0");
  }

  console.log("💡 Additional calculations:", {
    clientSatisfaction,
    averageOrderValue,
  });

  const finalStats = {
    totalRevenue,
    revenueGrowth,
    activeClients,
    newClientsThisMonth,
    pendingOrders,
    ordersThisWeek,
    inventoryValue,
    totalInventoryItems,
    completionRate,
    clientSatisfaction,
    averageOrderValue,
    lastUpdated: new Date(),
  };

  console.log("✅ Final calculated stats:", finalStats);
  return finalStats;
};

/**
 * Get default stats when no data is available
 * @returns {Object} Default statistics
 */
const getDefaultStats = () => ({
  totalRevenue: 0,
  revenueGrowth: 0,
  activeClients: 0,
  newClientsThisMonth: 0,
  pendingOrders: 0,
  ordersThisWeek: 0,
  inventoryValue: 0,
  totalInventoryItems: 0,
  completionRate: 0,
  clientSatisfaction: 0,
  averageOrderValue: 0,
  lastUpdated: new Date(),
});

/**
 * Get sales chart data for the current and previous year
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of monthly sales data
 */
export const getSalesChartData = async (userEmail) => {
  console.log("📊 getSalesChartData called with userEmail:", userEmail);

  try {
    if (!userEmail) {
      console.warn("❌ No user email provided to getSalesChartData");
      return getDefaultChartData();
    }

    const invoices = await getInvoices(userEmail);
    console.log(
      "invoiceeeeeeeeeeeeeeee 💰 Chart data - invoices fetched:",
      invoices.length
    );

    invoices.forEach((invoice, index) => {
      const amount =
        parseFloat(invoice.totalAmount) ||
        parseFloat(invoice.total) ||
        parseFloat(invoice.amount) ||
        parseFloat(invoice.grandTotal) ||
        parseFloat(invoice.finalAmount) ||
        parseFloat(invoice.subtotal) ||
        0;

      console.log(`invoiceeeeeeeeeeeeeeee 💰 Chart Invoice ${index + 1}:`, {
        id: invoice.id,
        totalAmount: invoice.totalAmount,
        total: invoice.total,
        amount: invoice.amount,
        grandTotal: invoice.grandTotal,
        finalAmount: invoice.finalAmount,
        subtotal: invoice.subtotal,
        parsedAmount: amount,
      });
    });

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    console.log("📅 Chart years:", { currentYear, lastYear });

    // Initialize monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = months.map((month) => ({
      name: month,
      current: 0,
      last: 0,
    }));

    // Process invoices
    invoices.forEach((invoice) => {
      const invoiceDate = invoice.createdAt?.toDate
        ? invoice.createdAt.toDate()
        : new Date(invoice.createdAt);
      const year = invoiceDate.getFullYear();
      const month = invoiceDate.getMonth();

      // Try different possible field names for the amount
      const amount =
        parseFloat(invoice.totalAmount) ||
        parseFloat(invoice.total) ||
        parseFloat(invoice.amount) ||
        parseFloat(invoice.grandTotal) ||
        parseFloat(invoice.finalAmount) ||
        parseFloat(invoice.subtotal) ||
        0;

      console.log(
        `📊 Processing invoice: ${invoice.id}, date: ${invoiceDate}, year: ${year}, month: ${month}, amount: ₦${amount}`
      );

      if (year === currentYear) {
        chartData[month].current += amount;
        console.log(`  ➡️ Added ₦${amount} to ${months[month]} ${currentYear}`);
      } else if (year === lastYear) {
        chartData[month].last += amount;
        console.log(`  ➡️ Added ₦${amount} to ${months[month]} ${lastYear}`);
      }
    });

    console.log("✅ Final chart data:", chartData);
    return chartData;
  } catch (error) {
    console.error("❌ Error fetching sales chart data:", error);
    return getDefaultChartData();
  }
};

/**
 * Get default chart data when no data is available
 * @returns {Array} Default chart data
 */
const getDefaultChartData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month) => ({
    name: month,
    current: 0,
    last: 0,
  }));
};
