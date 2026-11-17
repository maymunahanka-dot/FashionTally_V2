import { useState, useEffect, useContext, useRef } from "react";
import { X } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import { CurrencyHint } from "../../components/MoneyAmount/MoneyAmount";
import { useDisplayCurrency } from "../../utils/useDisplayCurrency";
import "./NewOrderPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

/** `isOpen`: the slide-in panel stays mounted, so clients are reloaded each time it opens. */
const NewOrderPanel = ({ onClose, editMode = false, initialData = null, onSuccess, isOpen }) => {
  const { t: tx } = useTranslation();
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
  const [clientsLoading, setClientsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const { user } = useContext(NewAuthContext);
  const pricesTouched = useRef(false);
  const { currency, usdToNgn, symbol, toNaira } = useDisplayCurrency();

  // Load clients each time the panel opens, so a client added a moment ago is listed
  useEffect(() => {
    const loadClients = async () => {
      if (!user?.email || isOpen === false) return;
      setClientsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/client/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setClients(data.data);
      } catch (error) {
        console.error("❌ NewOrderPanel: Error loading clients:", error);
      } finally {
        setClientsLoading(false);
      }
    };
    loadClients();
  }, [user?.email, isOpen]);

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
          initialData.garmentType || initialData.category || initialData.originalData?.category
        )
      );
      setDesignStyleName(
        initialData.garmentDescription || initialData.name || initialData.title || initialData.originalData?.name || ""
      );
      setFabricType(initialData.fabric || initialData.originalData?.materials?.[0] || "");
      setQuantity("8");
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
          ? (initialData.dueDate instanceof Date
              ? initialData.dueDate.toISOString().split("T")[0]
              : String(initialData.dueDate).split("T")[0])
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
          initialData.depositPaid ||
            initialData.originalData?.depositPaid ||
            "0"
        )
      );
      setSpecialInstructions(
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

  useEffect(() => {
    pricesTouched.current = false;
  }, [editMode, initialData]);

  useEffect(() => {
    if (pricesTouched.current || !editMode || !initialData) return;
    if (currency !== "NGN" && !usdToNgn) return;
    const asEntry = (value) => {
      const naira = Number(value) || 0;
      return (naira / usdToNgn).toFixed(2);
    };
    if (currency === "NGN") return;
    setBasePrice(
      asEntry(
        initialData.basePrice ||
          initialData.originalData?.basePrice ||
          initialData.price ||
          initialData.originalData?.price ||
          0
      )
    );
    setDepositPaid(
      asEntry(
        initialData.depositPaid ||
          initialData.originalData?.depositPaid ||
          initialData.deposit ||
          0
      )
    );
    const existingAdditionalItems =
      initialData.additionalItems || initialData.originalData?.additionalItems || [];
    setAdditionalItems(
      existingAdditionalItems.map((item, index) => ({
        id: Date.now() + index + 1000,
        name: item.name || "",
        price: asEntry(item.price || 0),
      }))
    );
  }, [currency, usdToNgn, editMode, initialData]);

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
          const selectedClient = clients.find((c) => (c.id || c._id) === value);
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
        tx("auto.clientNameIsRequiredWhen_03b7");
    }
    if (!client && !clientEmail.trim()) {
      newErrors.clientEmail =
        tx("auto.clientEmailIsRequiredWhen_f67d");
    }
    if (!client && !clientPhone.trim()) {
      newErrors.clientPhone =
        tx("auto.clientPhoneIsRequiredWhen_e348");
    }

    if (!orderType) {
      newErrors.orderType = tx("auto.orderTypeIsRequired_09e1");
    }

    if (!designStyleName.trim()) {
      newErrors.designStyleName = tx("auto.designStyleNameIsRequired_30ae");
    }

    if (!fabricType) {
      newErrors.fabricType = tx("auto.fabricTypeIsRequired_526b");
    }

    if (!quantity || quantity <= 0) {
      newErrors.quantity = tx("auto.validQuantityIsRequired_3cb2");
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = tx("auto.deliveryDateIsRequired_c596");
    }

    if (!basePrice || basePrice <= 0) {
      newErrors.basePrice = tx("auto.validBasePriceIsRequired_ecd5");
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
      alert(tx("auto.youMustBeLoggedIn_432a"));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const preparedAdditionalItems = additionalItems
        .filter((item) => item.name?.trim() && item.price !== "")
        .map(({ name, price }) => ({
          name: name.trim(),
          price: toNaira(price),
        }));
      const base = toNaira(basePrice);
      const deposit = toNaira(depositPaid);
      const itemsTotal = preparedAdditionalItems.reduce((sum, item) => sum + item.price, 0);
      const totalPrice = base + itemsTotal;

      const orderPayload = {
        clientId: client || "",
        clientName: clientName || "",
        clientPhone: clientPhone || "",
        clientEmail: clientEmail || "",
        garmentType: mapOrderTypeToCategory(orderType),
        garmentDescription: designStyleName,
        name: designStyleName,
        fabric: fabricType || "",
        quantity: parseFloat(quantity) || 1,
        measurements: prepareMeasurementsForDatabase(measurements),
        dueDate: deliveryDate || "",
        basePrice: base,
        additionalItems: preparedAdditionalItems,
        price: totalPrice,
        deposit,
        depositPaid: deposit,
        balance: totalPrice - deposit,
        balanceDue: totalPrice - deposit,
        specialInstructions: specialInstructions || "",
        status: "in-progress",
        paymentStatus: "partial",
      };

      let res;
      if (editMode && initialData?.id) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/order/edit/${initialData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(orderPayload),
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/order/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(orderPayload),
          }
        );
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save order");

      // Reset form only if not in edit mode
      if (!editMode) {
        resetForm();
      }
      onSuccess && onSuccess();
      // Close panel
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      alert(error.message || tx("auto.failedToSaveOrderPlease_6639"));
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
          {tl(editMode ? tx("auto.editOrder_13fc") : tx("auto.createOrder_f69d"))}
        </h2>
      </div>

      {/* Form */}
      <form className="new_oda_form" onSubmit={handleSubmit}>
        <div className="new_oda_form_content">
          {/* Client Selection with Existing Button */}
          <div className="new_oda_form_group">
            <SearchableSelect
              label={tx("auto.clientOptional_4042")}
              placeholder={clientsLoading && !clients.length ? tl("Loading clients...") : tl("Search clients by name or phone")}
              value={client}
              onChange={(v) => handleInputChange("client", v)}
              loading={clientsLoading}
              loadingText={tl("Loading clients...")}
              emptyText={tl("No clients yet. Add one in Clients, or type the details below.")}
              clearable
              error={errors.client}
              options={clients.map((c) => ({
                value: c.id || c._id,
                label: c.name || c.email || c.phone,
                hint: c.phone,
                search: c.email,
              }))}
            />
          </div>
          {/* New Client Details */}
          <div className="new_oda_client_details">
            <h3 className="new_oda_section_title">{tx("auto.newClientDetails_7661")}</h3>

            {/* Client Name */}
            <div className="new_oda_form_group">
              <Input
                type="text"
                label={tx("auto.name_d145")}
                placeholder={tx("auto.eGAdunzeOkonkwo_f1cb")}
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
                label={tx("auto.email_604e")}
                placeholder={tx("auto.eGAdunzeExampleCom_f481")}
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
                label={tx("auto.phone_187a")}
                placeholder={tx("auto.eG234801234_527b")}
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
              label={tx("auto.orderType_b80b")}
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
              label={tx("auto.designStyleName_d3de")}
              placeholder={tx("auto.eGElegantWeddingGown_52db")}
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
                label={tx("auto.fabricType_ce68")}
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
                label={tx("auto.quantityYards_7c3a")}
                placeholder={tx("auto.eG5_9b53")}
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
              <h3 className="new_oda_section_title">{tx("auto.measurementsOptional_d737")}</h3>
              <button
                type="button"
                className="new_oda_add_measurement_btn"
                onClick={addMeasurementField}
              >
                <span className="new_oda_add_icon">+</span>
                <span>{tx("auto.addMeasurement_7891")}</span>
              </button>
            </div>
            <div className="new_oda_measurements_list">
              {measurements.map((measurement) => (
                <div key={measurement.id} className="new_oda_measurement_item">
                  <div className="new_oda_measurement_inputs">
                    <Input
                      type="text"
                      placeholder={tx("auto.fieldNameEGBust_83a0")}
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
                      placeholder={tx("auto.valueInches_f5da")}
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
                label={tx("auto.deliveryDate_7a1d")}
                placeholder={tx("auto.selectDate_b84a")}
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
            <h3 className="new_oda_section_title">{tx("auto.pricing_a0d9")}</h3>

            {/* Base Price and Deposit Row */}
            <div className="new_oda_form_row">
              <div className="new_oda_form_group new_oda_form_group_half">
                <Input
                  type="number"
                  label={tx("tpl.basePrice_66a9", { v0: symbol })}
                  placeholder={currency !== "NGN" ? tx("auto.eG50_d0c3") : tx("auto.eG50000_d1af")}
                  value={basePrice}
                  onChange={(e) => {
                    pricesTouched.current = true;
                    handleInputChange("basePrice", e);
                  }}
                  error={errors.basePrice}
                  required
                  variant="rounded"
                />
              </div>
              <div className="new_oda_form_group new_oda_form_group_half">
                <Input
                  type="number"
                  label={tx("tpl.depositPaid_ad4f", { v0: symbol })}
                  placeholder={currency !== "NGN" ? tx("auto.eG20_0931") : tx("auto.eG25000_6a2b")}
                  value={depositPaid}
                  onChange={(e) => {
                    pricesTouched.current = true;
                    handleInputChange("depositPaid", e);
                  }}
                  variant="rounded"
                />
              </div>
            </div>

            {/* Additional Items */}
            <div className="new_oda_additional_items">
              <div className="new_oda_additional_header">
                <h4 className="new_oda_additional_title">{tx("auto.additionalItems_407e")}</h4>
                <button
                  type="button"
                  className="new_oda_add_item_btn"
                  onClick={handleAddItem}
                >
                  <span className="new_oda_add_icon">+</span>
                  <span>{tx("auto.addItem_4dba")}</span>
                </button>
              </div>

              {/* Additional Items List */}
              <div className="new_oda_items_list">
                {additionalItems.length === 0 ? (
                  <div className="new_oda_no_items">
                    <p>
                      {tx("auto.noAdditionalItemsAddedClick_7e75")}
                    </p>
                  </div>
                ) : (
                  additionalItems.map((item) => (
                    <div key={item.id} className="new_oda_item_row">
                      <div className="new_oda_item_inputs">
                        <Input
                          type="text"
                          placeholder={tx("auto.itemName_b56b")}
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, "name", e.target.value)
                          }
                          variant="rounded"
                        />
                        <Input
                          type="number"
                          placeholder={tx("tpl.price_dc72", { v0: symbol })}
                          value={item.price}
                          onChange={(e) => {
                            pricesTouched.current = true;
                            handleItemChange(item.id, "price", e.target.value);
                          }}
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
            <CurrencyHint currency={currency} usdToNgn={usdToNgn} amount={calculateTotalAmount()} />
            <div className="new_oda_totals">
              <div className="new_oda_total_row">
                <span className="new_oda_total_label">{tx("auto.totalAmount_a10e")}</span>
                <span className="new_oda_total_value">
                  {tl(symbol)}
                  {calculateTotalAmount().toLocaleString()}
                </span>
              </div>
              <div className="new_oda_total_row">
                <span className="new_oda_total_label">{tx("auto.deposit_b8ca")}</span>
                <span className="new_oda_total_value">
                  {tl(symbol)}
                  {(parseFloat(depositPaid) || 0).toLocaleString()}
                </span>
              </div>
              <div className="new_oda_total_row new_oda_balance_row">
                <span className="new_oda_total_label">{tx("auto.balance_802d")}</span>
                <span className="new_oda_balance_value">
                  {tl(symbol)}
                  {calculateBalance().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          {/* Special Instructions */}
          <div className="new_oda_form_group">
            <Input
              type="textarea"
              label={tx("auto.specialInstructionsNotes_7ea3")}
              placeholder={tx("auto.anySpecialRequirementsModificati_d888")}
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
            {loading ? tx("auto.saving_ae7e") : editMode ? tx("auto.updateOrder_56ac") : tx("auto.createOrder_0289")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrderPanel;
