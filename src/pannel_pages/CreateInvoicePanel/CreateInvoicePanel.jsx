import { useState, useEffect, useContext } from "react";
import { X, Plus, Calendar } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./CreateInvoicePanel.css";

const CreateInvoicePanel = ({ onClose, selectedInvoice, isEditMode, onSuccess }) => {
  // Form state
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState("Unpaid");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(7.5);
  const [items, setItems] = useState([
    {
      id: Date.now(),
      itemType: "Service",
      category: "Labor",
      description: "",
      quantity: "",
      price: 0,
      inventoryItemId: "",
      inventoryItemName: "",
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [recordAsIncome, setRecordAsIncome] = useState(false); // Default to false (commented out feature)
  const [updateFinanceTransaction, setUpdateFinanceTransaction] = useState(true); // For edit mode

  const { user } = useContext(NewAuthContext);

  // Load clients and inventory when component mounts
  useEffect(() => {
    if (user?.email) {
      loadClients();
      loadInventoryItems();
    }
  }, [user?.email]);

  // Populate form when editing or when client data is provided
  useEffect(() => {
    if (isEditMode && selectedInvoice) {
      // Edit mode - populate all invoice data
      setSelectedClientId("");
      setClientName(selectedInvoice.clientName || "");
      setEmail(selectedInvoice.clientEmail || "");
      setPhone(selectedInvoice.clientPhone || "");
      setAddress(selectedInvoice.clientAddress || "");
      setInvoiceDate(
        selectedInvoice.createdDate
          ? selectedInvoice.createdDate.toISOString().split("T")[0]
          : ""
      );
      setDueDate(
        selectedInvoice.dueDate
          ? selectedInvoice.dueDate.toISOString().split("T")[0]
          : ""
      );
      setNotes(selectedInvoice.notes || "");
      setPaymentMethod(selectedInvoice.paymentMethod || "Cash");
      setStatus(selectedInvoice.status || "Unpaid");
      setDiscount(selectedInvoice.discount || 0);
      setTaxRate(7.5); // Always fixed at 7.5%
      setRecordAsIncome(false); // Don't record as income when editing
      setUpdateFinanceTransaction(true); // Default to true for editing
      setItems(
        selectedInvoice.items?.map((item, index) => ({
          ...item,
          id: item.id || Date.now() + index,
        })) || [
          {
            id: Date.now(),
            itemType: "Service",
            category: "Labor",
            description: "",
            quantity: "",
            price: 0,
            inventoryItemId: "",
            inventoryItemName: "",
          },
        ]
      );
    } else if (!isEditMode && selectedInvoice) {
      // New invoice with pre-filled client data
      setSelectedClientId("");
      setClientName(selectedInvoice.clientName || "");
      setEmail(selectedInvoice.clientEmail || "");
      setPhone(selectedInvoice.clientPhone || "");
      setAddress(selectedInvoice.clientAddress || "");
      setRecordAsIncome(false); // Default to false (commented out feature)
      setUpdateFinanceTransaction(true); // Not used for new invoices

      // Set default dates for new invoice
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setInvoiceDate(today);
      setDueDate(nextWeek);
    } else {
      // Reset form for completely new invoice
      setSelectedClientId("");
      setClientName("");
      setEmail("");
      setPhone("");
      setAddress("");
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setInvoiceDate(today);
      setDueDate(nextWeek);
      setRecordAsIncome(false); // Default to false (commented out feature)
      setUpdateFinanceTransaction(true); // Not used for new invoices
    }
  }, [isEditMode, selectedInvoice]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (error) {
      console.error("❌ CreateInvoicePanel: Error loading clients:", error);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setInventoryItems(data.data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  // Generate invoice number based on timestamp
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const seq = Date.now().toString().slice(-4);
    return `INV-${year}-${seq}`;
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleClientSelection = (clientId) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (selectedClient) {
      setSelectedClientId(clientId);
      setClientName(selectedClient.name);
      setEmail(selectedClient.email);
      setPhone(selectedClient.phone);
      setAddress(selectedClient.address || "");
    }
  };

  const handleInventoryItemSelection = (inventoryItemId, itemIndex) => {
    const selectedItem = inventoryItems.find(
      (item) => item.id === inventoryItemId
    );
    if (selectedItem) {
      const updatedItems = items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              inventoryItemId: inventoryItemId,
              inventoryItemName: selectedItem.name,
              description: selectedItem.name,
              price: selectedItem.price || 0,
              category: selectedItem.category,
              // Reset quantity to 1 when selecting new item
              quantity: "",
            }
          : item
      );
      setItems(updatedItems);
    }
  };

  const getInventoryItemStock = (inventoryItemId) => {
    const item = inventoryItems.find((item) => item.id === inventoryItemId);
    return item ? item.quantity : 0;
  };

  const addItem = () => {
    setItems([
      {
        id: Date.now() + Math.random(),
        itemType: "Service",
        category: "Labor",
        description: "",
        quantity: "",
        price: 0,
        inventoryItemId: "",
        inventoryItemName: "",
      },
      ...items,
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTaxAmount = () => {
    const discountedSubtotal = calculateSubtotal() - calculateDiscountAmount();
    return (discountedSubtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() - calculateDiscountAmount() + calculateTaxAmount()
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
    }

    if (items.some((item) => !item.description.trim())) {
      newErrors.items = "All items must have a description";
    }

    // Validate inventory availability for items
    for (const item of items) {
      if (item.itemType === "Item" && item.inventoryItemId) {
        const availableStock = getInventoryItemStock(item.inventoryItemId);
        if (item.quantity > availableStock) {
          newErrors.items = `Insufficient stock for ${item.inventoryItemName}. Available: ${availableStock}, Required: ${item.quantity}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      setErrors({ submit: "You must be logged in to create invoices" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscountAmount();
      const taxAmount = calculateTaxAmount();
      const total = calculateTotal();

      const token = localStorage.getItem("authToken");
      const invoicePayload = {
        invoiceNumber: isEditMode ? selectedInvoice.invoiceNumber : generateInvoiceNumber(),
        clientName: clientName.trim(),
        clientEmail: email.trim(),
        clientPhone: phone.trim(),
        clientAddress: address.trim(),
        status,
        paymentMethod,
        createdDate: invoiceDate || new Date().toISOString(),
        dueDate: dueDate || "",
        items: items.map((item) => ({
          itemType: item.itemType,
          category: item.category,
          description: item.description.trim(),
          quantity: item.quantity,
          price: item.price,
        })),
        discount,
        taxRate,
        subtotal,
        discountAmount,
        taxAmount,
        amount: total,
        notes: notes.trim(),
      };

      let res;
      if (isEditMode && selectedInvoice?.id) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/invoice/edit/${selectedInvoice.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(invoicePayload),
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/invoice/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(invoicePayload),
          }
        );
      }

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to save invoice");

      // Deduct inventory quantities for new invoices
      if (!isEditMode) {
        const token2 = localStorage.getItem("authToken");
        for (const item of items) {
          if (item.itemType === "Item" && item.inventoryItemId) {
            const invItem = inventoryItems.find((i) => i.id === item.inventoryItemId);
            if (invItem) {
              const newQty = Math.max(0, (invItem.quantity || 0) - item.quantity);
              const newStatus = newQty <= 0 ? "Out of Stock" : newQty <= (invItem.reorderPoint || 3) ? "Low Stock" : "In Stock";
              await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/inventory/edit/${item.inventoryItemId}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token2}` },
                  body: JSON.stringify({ quantity: newQty, status: newStatus }),
                }
              );
            }
          }
        }
      }

      onSuccess && onSuccess();
      // Reset form and close
      setClientName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setInvoiceDate("");
      setDueDate("");
      setNotes("");
      setItems([
        {
          id: Date.now(),
          itemType: "Service",
          category: "Labor",
          description: "",
          quantity: "",
          price: 0,
          inventoryItemId: "",
          inventoryItemName: "",
        },
      ]);
      setDiscount(0);
      setTaxRate(7.5);
      setStatus("Unpaid");
      setPaymentMethod("Cash");
      setRecordAsIncome(false);
      setSelectedClientId("");

      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      setErrors({ submit: "Failed to save invoice. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="create_invoice_panel">
      {/* Header */}
      <div className="create_invoice_header">
        <button className="create_invoice_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="create_invoice_title">
          {isEditMode ? "Edit Invoice" : "Create Invoice"}
        </h2>
      </div>

      {/* Form */}
      <form className="create_invoice_form" onSubmit={handleSubmit}>
        {/* Client Details Section */}
        <div className="create_invoice_section">
          <h3 className="create_invoice_section_title">Client Details</h3>

          <div className="create_invoice_form_group">
            <Input
              label="Select Existing Client"
              type="select"
              placeholder="Choose a client or enter manually"
              value={selectedClientId}
              onChange={(e) => handleClientSelection(e.target.value)}
              variant="rounded"
              options={[
                { value: "", label: "Choose a client or enter manually" },
                ...clients.map((client) => ({
                  value: client.id,
                  label: `${client.name} - ${client.phone}`,
                })),
              ]}
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Client Name *"
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                clearError("clientName");
              }}
              error={errors.clientName}
              required
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Email Address *"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              error={errors.email}
              required
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Phone Number"
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label="Address"
              type="textarea"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              variant="rounded"
              rows={3}
            />
          </div>
        </div>

        {/* Date Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Invoice Date"
              type="date"
              placeholder="DD/MM/YYYY"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              variant="rounded"
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Due Date *"
              type="date"
              placeholder="DD/MM/YYYY"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearError("dueDate");
              }}
              error={errors.dueDate}
              required
              variant="rounded"
            />
          </div>
        </div>

        {/* Payment & Status Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Payment Method"
              type="select"
              placeholder="Select payment method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              variant="rounded"
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Bank Transfer", label: "Bank Transfer" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Mobile Money", label: "Mobile Money" },
                { value: "Cheque", label: "Cheque" },
              ]}
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Status"
              type="select"
              placeholder="Select status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              variant="rounded"
              options={[
                { value: "Unpaid", label: "Unpaid" },
                { value: "Paid", label: "Paid" },
                { value: "Partially Paid", label: "Partially Paid" },
              ]}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="create_invoice_section">
          <div className="create_invoice_items_header">
            <h3 className="create_invoice_section_title">Items</h3>
            <button
              type="button"
              className="create_invoice_add_item_btn"
              onClick={addItem}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="create_invoice_item">
              {/* Item Type Selection */}
              <div className="create_invoice_form_group">
                <Input
                  label="Item Type"
                  type="select"
                  placeholder="Select item type"
                  value={item.itemType}
                  onChange={(e) => {
                    const newItemType = e.target.value;
                    const updatedItems = items.map((currentItem, i) => {
                      if (i === index) {
                        if (newItemType === "Service") {
                          return {
                            ...currentItem,
                            itemType: newItemType,
                            category: "Labor",
                            inventoryItemId: "",
                            inventoryItemName: "",
                            description: "",
                            price: 0,
                          };
                        } else {
                          return {
                            ...currentItem,
                            itemType: newItemType,
                            category: "Item",
                            inventoryItemId: "",
                            inventoryItemName: "",
                            description: "",
                            price: 0,
                            quantity: "",
                          };
                        }
                      }
                      return currentItem;
                    });
                    setItems(updatedItems);
                  }}
                  variant="rounded"
                  options={[
                    { value: "Service", label: "Service" },
                    { value: "Item", label: "Inventory Item" },
                  ]}
                />
              </div>

              {/* Service Type or Inventory Item Selection */}
              {item.itemType === "Service" ? (
                <div className="create_invoice_form_group">
                  <Input
                    label="Service Type"
                    type="select"
                    placeholder="Select service type"
                    value={item.category}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    variant="rounded"
                    options={[
                      { value: "Labor", label: "Labor" },
                      { value: "Design Work", label: "Design Work" },
                      { value: "Alterations", label: "Alterations" },
                    ]}
                  />
                </div>
              ) : (
                <div className="create_invoice_form_group">
                  <Input
                    label="Select Inventory Item"
                    type="select"
                    placeholder="Choose inventory item"
                    value={item.inventoryItemId}
                    onChange={(e) =>
                      handleInventoryItemSelection(e.target.value, index)
                    }
                    variant="rounded"
                    options={[
                      { value: "", label: "Choose inventory item" },
                      ...inventoryItems.map((invItem) => ({
                        value: invItem.id,
                        label: `${invItem.name} - ${invItem.category} - ${invItem.sku} (Stock: ${invItem.quantity})`,
                      })),
                    ]}
                  />
                  {/* Stock Information Display */}
                  {item.inventoryItemId && (
                    <div className="create_invoice_stock_info">
                      <p className="create_invoice_stock_text">
                        📦 Available Stock:{" "}
                        {getInventoryItemStock(item.inventoryItemId)} units
                        {item.inventoryItemName &&
                          ` - ${item.inventoryItemName}`}
                      </p>
                      {getInventoryItemStock(item.inventoryItemId) <= 3 && (
                        <p className="create_invoice_stock_warning">
                          ⚠️ Low stock warning!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="create_invoice_form_group">
                <Input
                  label="Description"
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  variant="rounded"
                />
              </div>

              <div className="create_invoice_item_row">
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <Input
                    label="Quantity"
                    type="number"
                    placeholder=""
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value === "" ? "" : parseInt(e.target.value) || ""
                      )
                    }
                    variant="rounded"
                    min="1"
                    max={
                      item.itemType === "Item" && item.inventoryItemId
                        ? getInventoryItemStock(item.inventoryItemId)
                        : undefined
                    }
                  />
                  {item.itemType === "Item" && item.inventoryItemId && (
                    <p className="create_invoice_quantity_helper">
                      Max available:{" "}
                      {getInventoryItemStock(item.inventoryItemId)}
                    </p>
                  )}
                </div>
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <Input
                    label="Price"
                    type="number"
                    placeholder="₦0"
                    value={item.price === 0 ? "" : item.price}
                    onFocus={(e) => { if (parseFloat(e.target.value) === 0) updateItem(index, "price", ""); }}
                    onChange={(e) =>
                      updateItem(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                    }
                    variant="rounded"
                    min="0"
                  />
                </div>
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <label className="create_invoice_item_total_label">
                    Total
                  </label>
                  <div className="create_invoice_item_total">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="create_invoice_remove_item_btn"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {errors.items && (
            <span className="create_invoice_error_message">{errors.items}</span>
          )}
        </div>

        {/* Discount & Tax Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Discount (%)"
              type="number"
              placeholder="0"
              value={discount === 0 ? "" : discount}
              onFocus={(e) => { if (parseFloat(e.target.value) === 0) setDiscount(""); }}
              onChange={(e) => setDiscount(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
              variant="rounded"
              min="0"
              max="100"
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label="Tax Rate (%)"
              type="number"
              placeholder="7.5"
              value={taxRate}
              onChange={(e) => {}} // Read-only, no changes allowed
              variant="rounded"
              min="0"
              max="100"
              disabled={true}
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="create_invoice_section">
          <div className="create_invoice_form_group">
            <Input
              label="Notes (Optional)"
              type="textarea"
              placeholder="Add payment terms, delivery notes, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="rounded"
              rows={4}
            />
          </div>
        </div>

        {/* Record as Income Checkbox - Only show when creating new invoice */}
        {/* COMMENTED OUT: Finance integration feature disabled by default */}
        {/* {!isEditMode && (
          <div className="create_invoice_section">
            <div className="create_invoice_checkbox_container">
              <input
                type="checkbox"
                id="recordAsIncome"
                checked={recordAsIncome}
                onChange={(e) => setRecordAsIncome(e.target.checked)}
                disabled={isSubmitting}
                className="create_invoice_checkbox"
              />
              <label htmlFor="recordAsIncome" className="create_invoice_checkbox_label">
                <span className="create_invoice_checkbox_text">
                  Record as income in finances
                </span>
                <span className="create_invoice_checkbox_description">
                  Automatically create a finance transaction for this invoice
                  {calculateTotal() > 0 && (
                    <span className="create_invoice_income_amount">
                      {" "}({formatCurrency(calculateTotal())})
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        )} */}

        {/* Update Finance Transaction Checkbox - Only show when editing */}
        {/* COMMENTED OUT: Finance integration feature disabled by default */}
        {/* {isEditMode && (
          <div className="create_invoice_section">
            <div className="create_invoice_checkbox_container">
              <input
                type="checkbox"
                id="updateFinanceTransaction"
                checked={updateFinanceTransaction}
                onChange={(e) => setUpdateFinanceTransaction(e.target.checked)}
                disabled={isSubmitting}
                className="create_invoice_checkbox"
              />
              <label htmlFor="updateFinanceTransaction" className="create_invoice_checkbox_label">
                <span className="create_invoice_checkbox_text">
                  Update related finance transaction
                </span>
                <span className="create_invoice_checkbox_description">
                  Automatically update the income transaction in finances
                  {calculateTotal() > 0 && (
                    <span className="create_invoice_income_amount">
                      {" "}({formatCurrency(calculateTotal())})
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        )} */}

        {/* Summary Section */}
        <div className="create_invoice_summary">
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">Subtotal</span>
            <span className="create_invoice_summary_value">
              {formatCurrency(calculateSubtotal())}
            </span>
          </div>
          {discount > 0 && (
            <div className="create_invoice_summary_row">
              <span className="create_invoice_summary_label">
                Discount ({discount}%)
              </span>
              <span className="create_invoice_summary_value">
                -{formatCurrency(calculateDiscountAmount())}
              </span>
            </div>
          )}
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">
              Tax ({taxRate}%)
            </span>
            <span className="create_invoice_summary_value">
              {formatCurrency(calculateTaxAmount())}
            </span>
          </div>
          <div className="create_invoice_summary_row create_invoice_summary_total">
            <span className="create_invoice_summary_label">Total</span>
            <span className="create_invoice_summary_value create_invoice_total_amount">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="create_invoice_error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          className="create_invoice_submit_btn"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Invoice"
            : "Create Invoice"}
        </Button>
      </form>
    </div>
  );
};

export default CreateInvoicePanel;
