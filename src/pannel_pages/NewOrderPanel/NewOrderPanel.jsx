import { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Input from "../../components/Input";
import "./NewOrderPanel.css";

const NewOrderPanel = ({ onClose, editMode = false, initialData = null }) => {
  // Individual useState for each input field
  const [client, setClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderType, setOrderType] = useState("");
  const [designStyleName, setDesignStyleName] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [measurements, setMeasurements] = useState([
    { id: Date.now(), field: "", value: "" },
  ]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [depositPaid, setDepositPaid] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [additionalItems, setAdditionalItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const { user } = useContext(NewAuthContext);

  // Load clients when component mounts
  useEffect(() => {
    const loadClients = async () => {
      if (!user?.email) {
        console.log("❌ NewOrderPanel: No user email, skipping client load");
        return;
      }

      try {
        console.log("🔄 NewOrderPanel: Loading clients for user:", user.email);
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);
        console.log("📧 NewOrderPanel: Using effective email:", effectiveEmail);

        const clientsQuery = query(
          collection(db, "fashiontally_clients"),
          where("userEmail", "==", effectiveEmail),
          orderBy("name", "asc")
        );
        const snapshot = await getDocs(clientsQuery);
        const clientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(
          "✅ NewOrderPanel: Loaded clients:",
          clientsData.length,
          clientsData
        );
        setClients(clientsData);
      } catch (error) {
        console.error("❌ NewOrderPanel: Error loading clients:", error);
      }
    };

    loadClients();
  }, [user?.email]);

  // Initialize form data when in edit mode or when client data is provided
  useEffect(() => {
    if (editMode && initialData) {
      // Edit mode - populate all order data
      setClient(initialData.clientId || "");
      setClientName(initialData.client?.name || initialData.clientName || "");
      setClientEmail(
        initialData.client?.email || initialData.clientEmail || ""
      );
      setClientPhone(
        initialData.client?.phone || initialData.clientPhone || ""
      );
      setOrderType(
        mapCategoryToOrderType(
          initialData.category || initialData.originalData?.category
        )
      );
      setDesignStyleName(
        initialData.title || initialData.originalData?.garmentDescription || initialData.originalData?.name || ""
      );
      setFabricType(initialData.originalData?.fabric || initialData.originalData?.materials?.[0] || "");
      setQuantity(String(initialData.originalData?.quantity || initialData.quantity || "1"));
      // Convert measurements object to array format
      const existingMeasurements =
        initialData.measurements ||
        initialData.originalData?.measurements ||
        {};
      const measurementsArray = Object.entries(existingMeasurements).map(
        ([field, value], index) => ({
          id: Date.now() + index,
          field,
          value: value.toString(),
        })
      );

      setMeasurements(
        measurementsArray.length > 0
          ? measurementsArray
          : [{ id: Date.now(), field: "", value: "" }]
      );
      setDeliveryDate(
        initialData.dueDate
          ? initialData.dueDate.toISOString().split("T")[0]
          : ""
      );
      setBasePrice(
        String(
          initialData.basePrice ||
            initialData.originalData?.basePrice ||
            initialData.price ||
            initialData.originalData?.price ||
            ""
        )
      );
      setDepositPaid(
        String(
          initialData.deposit ||
            initialData.originalData?.deposit ||
            initialData.depositPaid ||
            initialData.originalData?.depositPaid ||
            "0"
        )
      );
      setSpecialInstructions(
        initialData.specialInstructions || initialData.originalData?.specialInstructions ||
        initialData.description || initialData.originalData?.description || ""
      );
      // Load additional items
      const existingAdditionalItems =
        initialData.additionalItems ||
        initialData.originalData?.additionalItems ||
        [];
      setAdditionalItems(
        existingAdditionalItems.map((item, index) => ({
          id: Date.now() + index + 1000,
          name: item.name || "",
          price: String(item.price || ""),
        }))
      );
    } else if (!editMode && initialData) {
      // New order with pre-filled client data
      setClient(initialData.clientId || "");
      setClientName(initialData.clientName || "");
      setClientEmail(initialData.clientEmail || "");
      setClientPhone(initialData.clientPhone || "");

      console.log("Pre-filling client data:", {
        clientId: initialData.clientId,
        clientName: initialData.clientName,
        clientEmail: initialData.clientEmail,
        clientPhone: initialData.clientPhone,
      });
    }
  }, [editMode, initialData]);

  // Map category to order type
  const mapCategoryToOrderType = (category) => {
    switch (category) {
      case "Dresses":
        return "evening_dress";
      case "Uniforms":
        return "custom_design";
      case "Shirts":
        return "casual_wear";
      case "Children's Wear":
        return "casual_wear";
      case "Tops":
        return "casual_wear";
      case "Bottoms":
        return "casual_wear";
      default:
        return "custom_design";
    }
  };

  // Map order type to category
  const mapOrderTypeToCategory = (orderType) => {
    switch (orderType) {
      case "wedding_gown":
        return "Dresses";
      case "evening_dress":
        return "Dresses";
      case "casual_wear":
        return "Tops";
      case "traditional_wear":
        return "Uniforms";
      case "suit":
        return "Uniforms";
      case "alterations":
        return "Others";
      case "custom_design":
        return "Others";
      default:
        return "Others";
    }
  };

  // Parse measurements array for database storage
  const prepareMeasurementsForDatabase = (measurementsArray) => {
    const cleanedMeasurements = {};

    measurementsArray.forEach(({ field, value }) => {
      if (
        field &&
        field.trim() !== "" &&
        value &&
        value.toString().trim() !== ""
      ) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          cleanedMeasurements[field.trim()] = numValue;
        }
      }
    });

    return Object.keys(cleanedMeasurements).length > 0
      ? cleanedMeasurements
      : {};
  };

  const CalendarIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );

  // Order type options
  const orderTypeOptions = [
    { value: "", label: "Select order" },
    { value: "wedding_gown", label: "Wedding Gown" },
    { value: "evening_dress", label: "Evening Dress" },
    { value: "casual_wear", label: "Casual Wear" },
    { value: "traditional_wear", label: "Traditional Wear" },
    { value: "suit", label: "Suit" },
    { value: "alterations", label: "Alterations" },
    { value: "custom_design", label: "Custom Design" },
  ];

  // Fabric type options
  const fabricTypeOptions = [
    { value: "", label: "Select fabric" },
    { value: "silk", label: "Silk" },
    { value: "satin", label: "Satin" },
    { value: "chiffon", label: "Chiffon" },
    { value: "lace", label: "Lace" },
    { value: "cotton", label: "Cotton" },
    { value: "wool", label: "Wool" },
    { value: "polyester", label: "Polyester" },
    { value: "tulle", label: "Tulle" },
    { value: "organza", label: "Organza" },
  ];

  const handleInputChange = (field, e) => {
    const value = e.target ? e.target.value : e;

    switch (field) {
      case "client":
        setClient(value);
        // Auto-fill client details when client is selected
        if (value) {
          const selectedClient = clients.find((c) => c.id === value);
          if (selectedClient) {
            setClientName(selectedClient.name || "");
            setClientEmail(selectedClient.email || "");
            setClientPhone(selectedClient.phone || "");
          }
        } else {
          // Clear client details when no client selected
          setClientName("");
          setClientEmail("");
          setClientPhone("");
        }
        break;
      case "clientName":
        setClientName(value);
        break;
      case "clientEmail":
        setClientEmail(value);
        break;
      case "clientPhone":
        setClientPhone(value);
        break;
      case "orderType":
        setOrderType(value);
        break;
      case "designStyleName":
        setDesignStyleName(value);
        break;
      case "fabricType":
        setFabricType(value);
        break;
      case "quantity":
        setQuantity(value);
        break;
      case "deliveryDate":
        setDeliveryDate(value);
        break;
      case "basePrice":
        setBasePrice(value);
        break;
      case "depositPaid":
        setDepositPaid(value);
        break;
      case "specialInstructions":
        setSpecialInstructions(value);
        break;
      default:
        break;
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle measurement field changes
  const handleMeasurementChange = (id, fieldType, value) => {
    setMeasurements((prev) =>
      prev.map((measurement) =>
        measurement.id === id
          ? { ...measurement, [fieldType]: value }
          : measurement
      )
    );
  };

  // Add new measurement field
  const addMeasurementField = () => {
    setMeasurements((prev) => [
      ...prev,
      { id: Date.now(), field: "", value: "" },
    ]);
  };

  // Remove measurement field
  const removeMeasurementField = (id) => {
    setMeasurements((prev) => {
      const filtered = prev.filter((measurement) => measurement.id !== id);
      // Always keep at least one measurement field
      return filtered.length === 0
        ? [{ id: Date.now(), field: "", value: "" }]
        : filtered;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Client selection is optional, but if no client selected, manual details are required
    if (!client && !clientName.trim()) {
      newErrors.clientName =
        "Client name is required when no client is selected";
    }
    if (!client && !clientEmail.trim()) {
      newErrors.clientEmail =
        "Client email is required when no client is selected";
    }
    if (!client && !clientPhone.trim()) {
      newErrors.clientPhone =
        "Client phone is required when no client is selected";
    }

    if (!orderType) {
      newErrors.orderType = "Order type is required";
    }

    if (!designStyleName.trim()) {
      newErrors.designStyleName = "Design/Style name is required";
    }

    if (!fabricType) {
      newErrors.fabricType = "Fabric type is required";
    }

    if (!quantity || quantity <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = "Delivery date is required";
    }

    if (!basePrice || basePrice <= 0) {
      newErrors.basePrice = "Valid base price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    const base = parseFloat(basePrice) || 0;
    const itemsTotal = additionalItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);
    return base + itemsTotal;
  };

  const calculateBalance = () => {
    const total = calculateTotalAmount();
    const deposit = parseFloat(depositPaid) || 0;
    return total - deposit;
  };

  // Add new additional item
  const handleAddItem = () => {
    setAdditionalItems([
      ...additionalItems,
      { id: Date.now(), name: "", price: "" },
    ]);
  };

  // Remove additional item
  const handleRemoveItem = (id) => {
    setAdditionalItems(additionalItems.filter((item) => item.id !== id));
  };

  // Update additional item
  const handleItemChange = (id, field, value) => {
    setAdditionalItems(
      additionalItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      alert("You must be logged in to create orders");
      return;
    }

    setLoading(true);

    try {
      // Prepare additional items for database
      const preparedAdditionalItems = additionalItems
        .filter(
          (item) =>
            item.name &&
            item.name.trim() !== "" &&
            item.price &&
            item.price.toString().trim() !== ""
        )
        .map((item) => ({
          name: item.name.trim(),
          price: parseFloat(item.price) || 0,
        }));

      // Calculate total price including additional items
      const totalPrice = calculateTotalAmount();

      // Prepare the order data in tally-main format
      const orderData = {
        type: "order",
        name: designStyleName,
        garmentDescription: designStyleName,
        garmentType: mapOrderTypeToCategory(orderType),
        category: mapOrderTypeToCategory(orderType),
        orderType: orderType,
        status: editMode ? (initialData?.originalData?.status || "pending") : "pending",
        description: specialInstructions || "",
        specialInstructions: specialInstructions || "",
        price: totalPrice,
        basePrice: parseFloat(basePrice) || 0,
        additionalItems: preparedAdditionalItems,
        deposit: parseFloat(depositPaid) || 0,
        depositPaid: parseFloat(depositPaid) || 0,
        balance: calculateBalance(),
        balanceDue: calculateBalance(),
        paymentStatus: parseFloat(depositPaid) > 0 ? "partial" : "unpaid",
        quantity: parseFloat(quantity) || 1,
        dueDate: deliveryDate || "",
        orderDate: deliveryDate || "",
        clientId: client || clientPhone || "",
        clientName: clientName || "",
        clientEmail: clientEmail || "",
        clientPhone: clientPhone || "",
        color: "",
        fabric: fabricType || "",
        measurements: prepareMeasurementsForDatabase(measurements),
        materials: fabricType ? [fabricType] : [],
        images: [],
        notes: specialInstructions || "",
        userEmail: getEffectiveUserEmail(user),
        tailorId: getEffectiveUserEmail(user),
        updatedAt: new Date().toISOString(),
      };

      if (editMode && initialData?.id) {
        // Update existing order
        await updateDoc(
          doc(db, "fashiontally_designs", initialData.id),
          orderData
        );
        console.log("Order updated successfully");
      } else {
        // Create new order
        await addDoc(collection(db, "fashiontally_designs"), orderData);
        console.log("Order created successfully");
      }

      // Reset form only if not in edit mode
      if (!editMode) {
        resetForm();
      }

      // Close panel
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClient("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setOrderType("");
    setDesignStyleName("");
    setFabricType("");
    setQuantity("");
    setMeasurements([{ id: Date.now(), field: "", value: "" }]);
    setDeliveryDate("");
    setBasePrice("");
    setDepositPaid("");
    setSpecialInstructions("");
    setAdditionalItems([]);
  };

  const handleClose = () => {
    // Reset form and errors when closing (only if not in edit mode)
    if (!editMode) {
      resetForm();
    }
    setErrors({});
    onClose();
  };

  return (
    <div className="new_oda_panel">
      {/* Header */}
      <div className="new_oda_header">
        <button className="new_oda_back_btn" onClick={handleClose}>
          <X size={24} />
        </button>
        <h2 className="new_oda_title">
          {editMode ? "Edit Order" : "Create order"}
        </h2>
      </div>

      {/* Form */}
      <form className="new_oda_form" onSubmit={handleSubmit}>
        <div className="new_oda_form_content">
          {/* Client Selection with Existing Button */}
          <div className="new_oda_form_group">
            <label className="new_oda_client_label">Client (Optional)</label>
            <div className="new_oda_client_row">
              <div className="new_oda_client_select">
                <Input
                  type="select"
                  value={client}
                  onChange={(e) => handleInputChange("client", e)}
                  options={[
                    { value: "", label: "Select client" },
                    ...clients.map((c) => ({
                      value: c.id,
                      label: `${c.name} - ${c.phone}`,
                    })),
                  ]}
                  error={errors.client}
                  variant="rounded"
                />
              </div>
              <button
                type="button"
                className="new_oda_existing_btn"
                onClick={() => {
                  /* Handle existing client selection */
                }}
              >
                ← Existing
              </button>
            </div>
          </div>
          {/* New Client Details */}
          <div className="new_oda_client_details">
            <h3 className="new_oda_section_title">New Client Details</h3>

            {/* Client Name */}
            <div className="new_oda_form_group">
              <Input
                type="text"
                label="Name *"
                placeholder="e.g., Adunze Okonkwo"
                value={clientName}
                onChange={(e) => handleInputChange("clientName", e)}
                error={errors.clientName}
                required
                variant="rounded"
              />
            </div>

            {/* Client Email */}
            <div className="new_oda_form_group">
              <Input
                type="email"
                label="Email *"
                placeholder="e.g., adunze@example.com"
                value={clientEmail}
                onChange={(e) => handleInputChange("clientEmail", e)}
                error={errors.clientEmail}
                required
                variant="rounded"
              />
            </div>

            {/* Client Phone */}
            <div className="new_oda_form_group">
              <Input
                type="text"
                label="Phone *"
                placeholder="e.g., +234 801 234 5678"
                value={clientPhone}
                onChange={(e) => handleInputChange("clientPhone", e)}
                error={errors.clientPhone}
                required
                variant="rounded"
              />
            </div>
          </div>
          {/* Order Type */}
          <div className="new_oda_form_group">
            <Input
              type="select"
              label="Order Type *"
              value={orderType}
              onChange={(e) => handleInputChange("orderType", e)}
              options={orderTypeOptions}
              error={errors.orderType}
              required
              variant="rounded"
            />
          </div>
          {/* Design/Style Name */}
          <div className="new_oda_form_group">
            <Input
              type="text"
              label="Design/Style Name *"
              placeholder="e.g., Elegant Wedding Gown"
              value={designStyleName}
              onChange={(e) => handleInputChange("designStyleName", e)}
              error={errors.designStyleName}
              required
              variant="rounded"
            />
          </div>
          {/* Fabric Type and Quantity Row */}
          <div className="new_oda_form_row">
            <div className="new_oda_form_group new_oda_form_group_half">
              <Input
                type="select"
                label="Fabric Type"
                value={fabricType}
                onChange={(e) => handleInputChange("fabricType", e)}
                options={fabricTypeOptions}
                error={errors.fabricType}
                variant="rounded"
              />
            </div>
            <div className="new_oda_form_group new_oda_form_group_half">
              <Input
                type="number"
                label="Quantity (yards)"
                placeholder="e.g., 5"
                value={quantity}
                onChange={(e) => handleInputChange("quantity", e)}
                error={errors.quantity}
                variant="rounded"
              />
            </div>
          </div>
          {/* Measurements */}
          <div className="new_oda_form_group">
            <div className="new_oda_measurements_header">
              <h3 className="new_oda_section_title">Measurements (Optional)</h3>
              <button
                type="button"
                className="new_oda_add_measurement_btn"
                onClick={addMeasurementField}
              >
                <span className="new_oda_add_icon">+</span>
                <span>Add Measurement</span>
              </button>
            </div>
            <div className="new_oda_measurements_list">
              {measurements.map((measurement, index) => (
                <div key={measurement.id} className="new_oda_measurement_item">
                  <div className="new_oda_measurement_inputs">
                    <Input
                      type="text"
                      placeholder="Field name (e.g., Bust, Waist, Length)"
                      value={measurement.field}
                      onChange={(e) =>
                        handleMeasurementChange(
                          measurement.id,
                          "field",
                          e.target.value
                        )
                      }
                      variant="rounded"
                    />
                    <Input
                      type="number"
                      placeholder="Value (inches)"
                      value={measurement.value}
                      onChange={(e) =>
                        handleMeasurementChange(
                          measurement.id,
                          "value",
                          e.target.value
                        )
                      }
                      variant="rounded"
                      step="0.1"
                    />
                  </div>
                  {measurements.length > 1 && (
                    <button
                      type="button"
                      className="new_oda_remove_measurement_btn"
                      onClick={() => removeMeasurementField(measurement.id)}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Delivery Date */}
          <div className="new_oda_form_group">
            <div className="new_oda_date_container">
              <Input
                type="date"
                label="Delivery Date *"
                placeholder="Select date"
                value={deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e)}
                error={errors.deliveryDate}
                required
                variant="rounded"
              />
              <CalendarIcon />
            </div>
          </div>
          {/* Pricing Section */}
          <div className="new_oda_pricing_section">
            <h3 className="new_oda_section_title">Pricing</h3>

            {/* Base Price and Deposit Row */}
            <div className="new_oda_form_row">
              <div className="new_oda_form_group new_oda_form_group_half">
                <Input
                  type="number"
                  label="Base Price (₦)"
                  placeholder="e.g., 50000"
                  value={basePrice}
                  onChange={(e) => handleInputChange("basePrice", e)}
                  error={errors.basePrice}
                  required
                  variant="rounded"
                />
              </div>
              <div className="new_oda_form_group new_oda_form_group_half">
                <Input
                  type="number"
                  label="Deposit Paid (₦)"
                  placeholder="e.g., 25000"
                  value={depositPaid}
                  onChange={(e) => handleInputChange("depositPaid", e)}
                  variant="rounded"
                />
              </div>
            </div>

            {/* Additional Items */}
            <div className="new_oda_additional_items">
              <div className="new_oda_additional_header">
                <h4 className="new_oda_additional_title">Additional Items</h4>
                <button
                  type="button"
                  className="new_oda_add_item_btn"
                  onClick={handleAddItem}
                >
                  <span className="new_oda_add_icon">+</span>
                  <span>Add Item</span>
                </button>
              </div>

              {/* Additional Items List */}
              <div className="new_oda_items_list">
                {additionalItems.length === 0 ? (
                  <div className="new_oda_no_items">
                    <p>
                      No additional items added. Click "Add Item" to add extras.
                    </p>
                  </div>
                ) : (
                  additionalItems.map((item) => (
                    <div key={item.id} className="new_oda_item_row">
                      <div className="new_oda_item_inputs">
                        <Input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, "name", e.target.value)
                          }
                          variant="rounded"
                        />
                        <Input
                          type="number"
                          placeholder="Price (₦)"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(item.id, "price", e.target.value)
                          }
                          variant="rounded"
                        />
                      </div>
                      <button
                        type="button"
                        className="new_oda_remove_item_btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="new_oda_totals">
              <div className="new_oda_total_row">
                <span className="new_oda_total_label">Total Amount:</span>
                <span className="new_oda_total_value">
                  ₦{calculateTotalAmount().toLocaleString()}
                </span>
              </div>
              <div className="new_oda_total_row">
                <span className="new_oda_total_label">Deposit:</span>
                <span className="new_oda_total_value">
                  ₦{(parseFloat(depositPaid) || 0).toLocaleString()}
                </span>
              </div>
              <div className="new_oda_total_row new_oda_balance_row">
                <span className="new_oda_total_label">Balance:</span>
                <span className="new_oda_balance_value">
                  ₦{calculateBalance().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          {/* Special Instructions */}
          <div className="new_oda_form_group">
            <Input
              type="textarea"
              label="Special Instructions / Notes"
              placeholder="Any special requirements, modifications, or notes..."
              value={specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e)}
              variant="rounded"
              rows={4}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="new_oda_form_footer">
          <button
            type="submit"
            className="new_oda_submit_btn"
            disabled={loading}
          >
            {loading ? "Saving..." : editMode ? "Update Order" : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrderPanel;
