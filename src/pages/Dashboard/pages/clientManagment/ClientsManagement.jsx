import { useState, useEffect, useContext } from "react";
import { Search, Filter, Plus, Phone, Mail, ChevronRight } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../../backend/firebase.config";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import SlideInMenu from "../../../../components/SlideInMenu";
import ClientDetailsPanel from "../../../../pannel_pages/ClientDetailsPanel";
import AddClientPanel from "../../../../pannel_pages/AddClientPanel";
import AddDesignPanel from "../../../../pannel_pages/AddDesignPanel/AddDesignPanel";
import DesignDetailsPanel from "../../../../pannel_pages/DesignDetailsPanel/DesignDetailsPanel";
import CreateInvoicePanel from "../../../../pannel_pages/CreateInvoicePanel/CreateInvoicePanel";
import InvoiceViewPanel from "../../../../pannel_pages/InvoiceViewPanel/InvoiceViewPanel";
import NewOrderPanel from "../../../../pannel_pages/NewOrderPanel";
import OrderDetailsPanel from "../../../../pannel_pages/OrderDetailsPanel/OrderDetailsPanel";
import Button from "../../../../components/button/Button";
import PageLoading from "../../../../components/Loading/PageLoading";
import "./ClientsManagement.css";

const ClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showAddDesign, setShowAddDesign] = useState(false);
  const [showDesignDetails, setShowDesignDetails] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showViewInvoice, setShowViewInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(NewAuthContext);

  // Fetch clients from Firebase with real-time updates
  useEffect(() => {
    if (!db || !user?.email) {
      setLoading(false);
      setClients([]);
      return;
    }

    setLoading(true);

    // Get effective email (main admin's email for team members)
    const effectiveEmail = getEffectiveUserEmail(user);

    // Set up the query to filter by effective user's email
    const clientQuery = query(
      collection(db, "fashiontally_clients"),
      where("userEmail", "==", effectiveEmail),
      orderBy("name", "asc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      clientQuery,
      (snapshot) => {
        const clientsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Helper function to safely convert dates
          const toDate = (dateValue) => {
            if (!dateValue) return null;
            if (dateValue.toDate && typeof dateValue.toDate === 'function') {
              return dateValue.toDate();
            }
            if (dateValue instanceof Date) {
              return dateValue;
            }
            if (typeof dateValue === 'string') {
              return new Date(dateValue);
            }
            return null;
          };
          
          return {
            id: doc.id, // This is the tenant-scoped ID
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address || "",
            status: data.status,
            notes: data.notes || "",
            createdAt: toDate(data.createdAt) || new Date(),
            updatedAt: toDate(data.updatedAt) || new Date(),
            totalSpent: data.totalSpent || 0,
            lastOrder: toDate(data.lastOrder),
            hasMeasurements: data.hasMeasurements || false,
            measurementsUpdatedAt: toDate(data.measurementsUpdatedAt),
          };
        });

        setClients(clientsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [user?.email]);

  // Filter and search clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && client.status === "Active") ||
      (filterStatus === "inactive" && client.status === "Inactive");

    return matchesSearch && matchesFilter;
  });

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleCloseClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientDetails(false);
    setShowAddClient(true);
  };

  // Design panel handlers
  const handleOpenAddDesign = (client) => {
    setSelectedClient(client);
    setShowClientDetails(false); // Close client details
    setShowAddDesign(true); // Open design panel
  };

  const handleCloseAddDesign = () => {
    setShowAddDesign(false);
    setSelectedDesign(null);
  };

  const handleDesignClick = (design) => {
    setSelectedDesign(design);
    setShowClientDetails(false); // Close client details
    setShowDesignDetails(true); // Open design details
  };

  const handleCloseDesignDetails = () => {
    setShowDesignDetails(false);
    setSelectedDesign(null);
  };

  // Invoice panel handlers
  const handleCreateInvoice = (client) => {
    setSelectedClient(client);
    setShowClientDetails(false); // Close client details
    setShowCreateInvoice(true); // Open create invoice panel
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowClientDetails(false); // Close client details
    setShowViewInvoice(true); // Open invoice view panel
  };

  const handleCloseViewInvoice = () => {
    setShowViewInvoice(false);
    setSelectedInvoice(null);
  };

  // Order panel handlers
  const handleCreateOrder = (client) => {
    setSelectedClient(client);
    setShowClientDetails(false); // Close client details
    setShowNewOrder(true); // Open new order panel
  };

  const handleCloseNewOrder = () => {
    setShowNewOrder(false);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowClientDetails(false); // Close client details
    setShowOrderDetails(true); // Open order details panel
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const formatDate = (date) => {
    if (!date) return "No orders yet";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="clients-management">
        <div className="clients-header">
          <h1 className="clients-title">Your Client Information Hub</h1>
        </div>
        <div className="clients-controls">
          <div className="search-section">
            <div className="search-input-containerr">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email"
                className="search-input"
                disabled
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="medium"
            icon={<Plus size={20} />}
            iconPosition="left"
            disabled
            className="add-client-btn"
          >
            <span className="add-client-text">Add Client</span>
          </Button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="clients-management">
        <div className="clients-header">
          <h1 className="clients-title">Your Client Information Hub</h1>
        </div>
        <div className="no-clients">
          <p>Please log in to view your clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-management">
      {/* Header */}
      <div className="clients-header">
        <h1 className="clients-title">Your Client Information Hub</h1>
      </div>

      {/* Search and Add Client Section */}
      <div className="clients-controls">
        <div className="search-section">
          <div className="search-input-containerr">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="ffilter-btn-inside"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="ffilter-dropdown">
              <div className="ffilter-option">
                <input
                  type="radio"
                  id="all"
                  name="filter"
                  value="all"
                  checked={filterStatus === "all"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="all">All Clients</label>
              </div>
              <div className="ffilter-option">
                <input
                  type="radio"
                  id="active"
                  name="filter"
                  value="active"
                  checked={filterStatus === "active"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="active">Active</label>
              </div>
              <div className="ffilter-option">
                <input
                  type="radio"
                  id="inactive"
                  name="filter"
                  value="inactive"
                  checked={filterStatus === "inactive"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="inactive">Inactive</label>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          onClick={() => setShowAddClient(true)}
          className="add-client-btn"
        >
          <span className="add-client-text">Add Client</span>
        </Button>

        {/* Mobile Floating Button */}
        <Button
          variant="primary"
          size="large"
          icon={<Plus size={24} />}
          onClick={() => setShowAddClient(true)}
          className="add-client-btn-mobile"
        />
      </div>

      {/* Add / Edit Client Panel */}
      <SlideInMenu
        isShow={showAddClient}
        onClose={() => { setShowAddClient(false); setEditingClient(null); }}
        position="rightt"
        width="480px"
      >
        <AddClientPanel
          onClose={() => { setShowAddClient(false); setEditingClient(null); }}
          editMode={!!editingClient}
          clientData={editingClient}
        />
      </SlideInMenu>

      {/* Client Details Panel */}
      <SlideInMenu
        isShow={showClientDetails}
        onClose={handleCloseClientDetails}
        position="rightt"
        width="500px"
      >
        <ClientDetailsPanel
          client={selectedClient}
          onClose={handleCloseClientDetails}
          onEditClient={handleEditClient}
          onOpenAddDesign={handleOpenAddDesign}
          onDesignClick={handleDesignClick}
          onCreateInvoice={handleCreateInvoice}
          onViewInvoice={handleViewInvoice}
          onCreateOrder={handleCreateOrder}
          onViewOrder={handleViewOrder}
        />
      </SlideInMenu>

      {/* Add Design Panel */}
      <SlideInMenu
        isShow={showAddDesign}
        onClose={handleCloseAddDesign}
        position="rightt"
        width="500px"
      >
        <AddDesignPanel
          onClose={handleCloseAddDesign}
          onSubmit={handleCloseAddDesign}
          editMode={false}
          initialData={{
            clientId: selectedClient?.id,
            clientName: selectedClient?.name,
          }}
        />
      </SlideInMenu>

      {/* Design Details Panel */}
      <SlideInMenu
        isShow={showDesignDetails}
        onClose={handleCloseDesignDetails}
        position="rightt"
        width="500px"
      >
        <DesignDetailsPanel
          design={selectedDesign}
          onClose={handleCloseDesignDetails}
        />
      </SlideInMenu>

      {/* Create Invoice Panel */}
      <SlideInMenu
        isShow={showCreateInvoice}
        onClose={handleCloseCreateInvoice}
        position="rightt"
        width="500px"
      >
        <CreateInvoicePanel
          onClose={handleCloseCreateInvoice}
          selectedInvoice={{
            clientName: selectedClient?.name,
            clientEmail: selectedClient?.email,
            clientPhone: selectedClient?.phone,
            clientAddress: selectedClient?.address,
          }}
          isEditMode={false}
        />
      </SlideInMenu>

      {/* Invoice View Panel */}
      <SlideInMenu
        isShow={showViewInvoice}
        onClose={handleCloseViewInvoice}
        position="rightt"
        width="500px"
      >
        <InvoiceViewPanel
          invoice={selectedInvoice}
          onClose={handleCloseViewInvoice}
        />
      </SlideInMenu>

      {/* New Order Panel */}
      <SlideInMenu
        isShow={showNewOrder}
        onClose={handleCloseNewOrder}
        position="rightt"
        width="500px"
      >
        <NewOrderPanel
          onClose={handleCloseNewOrder}
          editMode={false}
          initialData={{
            clientId: selectedClient?.id,
            clientName: selectedClient?.name,
            clientEmail: selectedClient?.email,
            clientPhone: selectedClient?.phone,
          }}
        />
      </SlideInMenu>

      {/* Order Details Panel */}
      <SlideInMenu
        isShow={showOrderDetails}
        onClose={handleCloseOrderDetails}
        position="rightt"
        width="500px"
      >
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onEdit={(order) => {
            setSelectedOrder(order);
            setShowOrderDetails(false);
            setShowNewOrder(true);
          }}
        />
      </SlideInMenu>

      {/* Clients Grid */}
      <div className="clients-grid">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="client-card"
            onClick={() => handleClientClick(client)}
          >
            <div className="client-main-content">
              <div className="client-header">
                <div
                  className={`client-status-dot ${
                    client.status === "Active" ? "active" : "inactive"
                  }`}
                ></div>
                <h3 className="client-name">{client.name}</h3>
              </div>

              <div className="client-contact">
                <div className="contact-item">
                  <Phone className="contact-icon" size={16} />
                  <span className="contact-text">{client.phone}</span>
                </div>
                <div className="contact-item">
                  <Mail className="contact-icon" size={16} />
                  <span className="contact-text">{client.email}</span>
                </div>
              </div>
            </div>

            <div className="client-sidebar">
              <div className="last-order">
                <span className="last-order-label">Last order:</span>
                <span className="last-order-date">
                  {formatDate(client.lastOrder)}
                </span>
              </div>
              <button
                className="client-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClientClick(client);
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && !loading && (
        <div className="no-clients">
          <p>
            {searchTerm || filterStatus !== "all"
              ? "No clients found matching your search criteria."
              : "No clients yet. Add your first client to get started!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;
