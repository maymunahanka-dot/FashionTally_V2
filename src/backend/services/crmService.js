
// Collection references

/**
 * Get all feedback for the current user — via backend
 */
export const getFeedback = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/feedback/list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

/**
 * Add new feedback — via backend
 */
export const addFeedback = async (feedbackData, userEmail, imageFile) => {
  try {
    const token = localStorage.getItem('authToken');
    const body = new FormData();
    body.append('data', JSON.stringify(feedbackData));
    if (imageFile) body.append('image', imageFile);
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/feedback/create`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data.id;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
};

/**
 * Reply to feedback — via backend
 */
export const replyToFeedback = async (feedbackId, reply) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/feedback/reply/${feedbackId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply }),
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('Error replying to feedback:', error);
    throw error;
  }
};

/**
 * Update feedback reply — via backend
 */
export const updateFeedbackReply = async (feedbackId, reply) => {
  return replyToFeedback(feedbackId, reply);
};

/**
 * Delete feedback — via backend
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/feedback/delete/${feedbackId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

/**
 * Update feedback — via backend
 */
export const updateFeedback = async (feedbackId, updateData, imageFile) => {
  try {
    const token = localStorage.getItem('authToken');
    const body = new FormData();
    body.append('data', JSON.stringify(updateData));
    if (imageFile) body.append('image', imageFile);
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/feedback/edit/${feedbackId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

/**
 * Get clients for the current user
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} Array of client objects
 */
export const getClients = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/client/list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    return [];
  }
};

export const getOrders = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/order/list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};

export const getInvoices = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/invoice/list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
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
 * Get all loyalty members for the current user — via backend
 */
export const getLoyaltyMembers = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/loyalty-member/list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    return [];
  }
};

/**
 * Add new loyalty member — via backend
 */
export const addLoyaltyMember = async (memberData) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/loyalty-member/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(memberData),
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data.id;
  } catch (error) {
    console.error('Error adding loyalty member:', error);
    throw error;
  }
};

/**
 * Update loyalty member — via backend
 */
export const updateLoyaltyMember = async (memberId, updateData) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/loyalty-member/edit/${memberId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateData),
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('Error updating loyalty member:', error);
    throw error;
  }
};

/**
 * Delete loyalty member — via backend
 */
export const deleteLoyaltyMember = async (memberId) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/loyalty-member/delete/${memberId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('Error deleting loyalty member:', error);
    throw error;
  }
};

// ============ LOYALTY STATS FUNCTIONS ============


// ============ DESIGNS FUNCTIONS ============

/**
 * Get all designs for the current user — via backend
 */
export const getDesigns = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/design/list?type=design`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('❌ Error fetching designs:', error);
    return [];
  }
};



/**
 * Delete design — via backend
 */
export const deleteDesign = async (designId) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/design/delete/${designId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
    console.error('❌ Error deleting design:', error);
    throw error;
  }
};

/**
 * Get designs for a specific client — via backend
 */
export const getDesignsByClientId = async (clientId, userEmail) => {
  try {
    if (!clientId) return [];
    const all = await getDesigns(userEmail);
    return all.filter(d => d.clientId === clientId);
  } catch (error) {
    console.error('❌ Error fetching designs by client:', error);
    return [];
  }
};

// ============ APPOINTMENTS FUNCTIONS ============

/**
 * Get today's appointments for the current user — via backend
 */
export const getTodaysAppointments = async (userEmail) => {
  try {
    if (!userEmail) return [];
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data?.data?.todaysAppointments || [];
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return [];
  }
};


// ============ DASHBOARD STATS FUNCTIONS ============

/**
 * Get comprehensive dashboard statistics — via backend
 */
export const getDashboardStats = async (userEmail) => {
  try {
    if (!userEmail) return getDefaultStats();
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.success) return getDefaultStats();
    return data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return getDefaultStats();
  }
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
 * Get sales chart data — via backend
 */
export const getSalesChartData = async (userEmail) => {
  try {
    if (!userEmail) return getDefaultChartData();
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.success) return getDefaultChartData();

    // Backend returns last 12 months; map to { name, current, last } for SalesChart
    const currentYear = new Date().getFullYear();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartMap = {};
    months.forEach(m => { chartMap[m] = { name: m, current: 0, last: 0 }; });

    (data.data.salesChart || []).forEach(({ month, year, revenue }) => {
      if (chartMap[month]) {
        if (year === currentYear) chartMap[month].current = revenue;
        else chartMap[month].last = revenue;
      }
    });

    return months.map(m => chartMap[m]);
  } catch (error) {
    console.error('Error fetching sales chart data:', error);
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
