import { useState, useEffect, useContext, useRef } from "react";
import { X, Plus } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import { CurrencyHint } from "../../components/MoneyAmount/MoneyAmount";
import { useDisplayCurrency } from "../../utils/useDisplayCurrency";
import { formatMoney } from "../../utils/exchangeRate";
import "./CreateInvoicePanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const CreateInvoicePanel = ({ onClose, selectedInvoice, isEditMode, onSuccess }) => {
  const { t: tx } = useTranslation();
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
  // Typed in only for "Partially Paid"; "Paid" uses the total, "Unpaid" is 0
  const [amountPaid, setAmountPaid] = useState("");
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
  const [, setRecordAsIncome] = useState(false); // Default to false (commented out feature)
  const [, setUpdateFinanceTransaction] = useState(true); // For edit mode

  const { user } = useContext(NewAuthContext);
  const pricesTouched = useRef(false);
  const { currency, usdToNgn, symbol, toNaira } = useDisplayCurrency();

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
      setTaxRate(selectedInvoice.taxRate ?? 7.5);
      {
        const paidNaira = Number(selectedInvoice.amountPaid) || 0;
        const shown = currency !== "NGN" && usdToNgn ? Number((paidNaira / usdToNgn).toFixed(2)) : paidNaira;
        setAmountPaid(paidNaira ? String(shown) : "");
      }
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

  useEffect(() => {
    pricesTouched.current = false;
  }, [isEditMode, selectedInvoice]);

  useEffect(() => {
    if (pricesTouched.current || !isEditMode || !selectedInvoice?.items || currency === "NGN" || !usdToNgn) return;
    setItems(
      selectedInvoice.items.map((item, index) => ({
        ...item,
        id: item.id || Date.now() + index,
        price: Number(((Number(item.price) || 0) / usdToNgn).toFixed(2)),
      }))
    );
  }, [currency, usdToNgn, isEditMode, selectedInvoice]);

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
              price:
                currency !== "NGN" && usdToNgn
                  ? Number(((selectedItem.price || 0) / usdToNgn).toFixed(2))
                  : selectedItem.price || 0,
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
    if (field === "price") pricesTouched.current = true;
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

  /** What the client has paid so far, from the status. */
  const calculateAmountPaid = () => {
    if (status === "Paid") return calculateTotal();
    if (status === "Partially Paid") return Math.min(parseFloat(amountPaid) || 0, calculateTotal());
    return 0;
  };
  const calculateBalanceDue = () => Math.max(0, calculateTotal() - calculateAmountPaid());

  const validateForm = () => {
    const newErrors = {};

    if (!clientName.trim()) {
      newErrors.clientName = tx("auto.clientNameIsRequired_2cf1");
    }

    if (!email.trim()) {
      newErrors.email = tx("auto.emailIsRequired_4da1");
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = tx("auto.dueDateIsRequired_e0a2");
    }

    if (status === "Partially Paid") {
      const paid = parseFloat(amountPaid) || 0;
      if (paid <= 0) newErrors.amountPaid = tl("Enter the amount paid");
      else if (paid >= calculateTotal()) newErrors.amountPaid = tl("Amount paid must be less than the total. Use the Paid status instead.");
    }

    if (items.some((item) => !item.description.trim())) {
      newErrors.items = tx("auto.allItemsMustHaveA_985f");
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
      setErrors({ submit: tx("auto.youMustBeLoggedIn_fada") });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const subtotal = toNaira(calculateSubtotal());
      const discountAmount = toNaira(calculateDiscountAmount());
      const taxAmount = toNaira(calculateTaxAmount());
      const total = toNaira(calculateTotal());
      const paidNaira = status === "Paid" ? total : toNaira(calculateAmountPaid());

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
          price: toNaira(item.price),
        })),
        discount,
        taxRate,
        subtotal,
        discountAmount,
        taxAmount,
        amount: total,
        amountPaid: paidNaira,
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
      setAmountPaid("");
      setStatus("Unpaid");
      setPaymentMethod("Cash");
      setRecordAsIncome(false);
      setSelectedClientId("");

      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      setErrors({ submit: error.message || tx("auto.failedToSaveInvoicePlease_849d") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return formatMoney(num, currency);
  };

  return (
    <div className="create_invoice_panel">
      {/* Header */}
      <div className="create_invoice_header">
        <button className="create_invoice_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="create_invoice_title">
          {tl(isEditMode ? tx("auto.editInvoice_caa9") : tx("auto.createInvoice_3281"))}
        </h2>
      </div>

      {/* Form */}
      <form className="create_invoice_form" onSubmit={handleSubmit}>
        {/* Client Details Section */}
        <div className="create_invoice_section">
          <h3 className="create_invoice_section_title">{tx("auto.clientDetails_7f08")}</h3>

          <div className="create_invoice_form_group">
            <Input
              label={tx("auto.selectExistingClient_7b2b")}
              type="select"
              placeholder={tx("auto.chooseAClientOrEnter_77d4")}
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
              label={tx("auto.clientName_95a0")}
              type="text"
              placeholder={tx("auto.clientName_130c")}
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
              label={tx("auto.emailAddress_ff92")}
              type="email"
              placeholder={tx("auto.emailAddress_09ba")}
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
              label={tx("auto.phoneNumber_ab25")}
              type="text"
              placeholder={tx("auto.phoneNumber_ab25")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="create_invoice_form_group">
            <Input
              label={tx("auto.address_d70f")}
              type="textarea"
              placeholder={tx("auto.address_d70f")}
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
              label={tx("auto.invoiceDate_8448")}
              type="date"
              placeholder={tx("auto.ddMmYyyy_5d95")}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              variant="rounded"
            />
          </div>
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label={tx("auto.dueDate_d7e2")}
              type="date"
              placeholder={tx("auto.ddMmYyyy_5d95")}
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
              label={tx("auto.paymentMethod_f383")}
              type="select"
              placeholder={tx("auto.selectPaymentMethod_2f31")}
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
              label={tx("auto.status_bae7")}
              type="select"
              placeholder={tx("auto.selectStatus_0332")}
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
            <h3 className="create_invoice_section_title">{tx("auto.items_44d2")}</h3>
            <button
              type="button"
              className="create_invoice_add_item_btn"
              onClick={addItem}
            >
              <Plus size={16} />
              {tx("auto.addItem_4dba")}
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="create_invoice_item">
              {/* Item Type Selection */}
              <div className="create_invoice_form_group">
                <Input
                  label={tx("auto.itemType_a9fc")}
                  type="select"
                  placeholder={tx("auto.selectItemType_ef20")}
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
                    label={tx("auto.serviceType_8941")}
                    type="select"
                    placeholder={tx("auto.selectServiceType_eaf5")}
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
                    label={tx("auto.selectInventoryItem_41ff")}
                    type="select"
                    placeholder={tx("auto.chooseInventoryItem_958a")}
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
                        {tx("auto.availableStock_12ab")}{" "}
                        {tl(getInventoryItemStock(item.inventoryItemId))}{" "}{tx("auto.units_9176")}
                        {item.inventoryItemName &&
                          ` - ${item.inventoryItemName}`}
                      </p>
                      {getInventoryItemStock(item.inventoryItemId) <= 3 && (
                        <p className="create_invoice_stock_warning">
                          {tx("auto.lowStockWarning_976a")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="create_invoice_form_group">
                <Input
                  label={tx("auto.description_55f8")}
                  type="text"
                  placeholder={tx("auto.description_55f8")}
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
                    label={tx("auto.quantity_44f6")}
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
                      {tx("auto.maxAvailable_8492")}{" "}
                      {tl(getInventoryItemStock(item.inventoryItemId))}
                    </p>
                  )}
                </div>
                <div className="create_invoice_form_group create_invoice_form_group_third">
                  <Input
                    label={tx("tpl.price_dc72", { v0: symbol })}
                    type="number"
                    placeholder={`${symbol}0`}
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
                    {tx("auto.total_b259")}
                  </label>
                  <div className="create_invoice_item_total">
                    {tl(formatCurrency(item.quantity * item.price))}
                  </div>
                </div>
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="create_invoice_remove_item_btn"
                  onClick={() => removeItem(index)}
                >
                  {tx("auto.remove_e963")}
                </button>
              )}
            </div>
          ))}

          {errors.items && (
            <span className="create_invoice_error_message">{tl(errors.items)}</span>
          )}
        </div>

        {/* Amount Paid: follows the status */}
        <div className="create_invoice_section">
          <div className="create_invoice_form_group">
            <Input
              label={`${tl("Amount Paid")} (${symbol})`}
              type="number"
              placeholder={`${symbol}0`}
              value={
                status === "Paid"
                  ? Number(calculateTotal().toFixed(2))
                  : status === "Partially Paid"
                  ? amountPaid
                  : 0
              }
              onChange={(e) => {
                setAmountPaid(e.target.value);
                clearError("amountPaid");
              }}
              disabled={status !== "Partially Paid"}
              error={errors.amountPaid}
              required={status === "Partially Paid"}
              variant="rounded"
              min="0"
            />
            <p className="create_invoice_quantity_helper">
              {tl(
                status === "Paid"
                  ? "Paid in full: the total is filled in."
                  : status === "Partially Paid"
                  ? "Enter how much the client has paid so far."
                  : "Unpaid: nothing paid yet. Change the status to record a payment."
              )}
            </p>
          </div>
        </div>

        {/* Discount & Tax Section */}
        <div className="create_invoice_date_section">
          <div className="create_invoice_form_group create_invoice_form_group_half">
            <Input
              label={tx("auto.discount_2d08")}
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
              label={tx("auto.taxRate_4550")}
              type="number"
              placeholder="0"
              value={taxRate === 0 ? "" : taxRate}
              onFocus={(e) => { if (parseFloat(e.target.value) === 0) setTaxRate(""); }}
              onChange={(e) => setTaxRate(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
              variant="rounded"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="create_invoice_section">
          <div className="create_invoice_form_group">
            <Input
              label={tx("auto.notesOptional_2fd5")}
              type="textarea"
              placeholder={tx("auto.addPaymentTermsDeliveryNotes_fe4f")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="rounded"
              rows={4}
            />
          </div>
        </div>

        <CurrencyHint currency={currency} usdToNgn={usdToNgn} amount={calculateTotal()} />

        {/* Summary Section */}
        <div className="create_invoice_summary">
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">{tx("auto.subtotal_97f7")}</span>
            <span className="create_invoice_summary_value">
              {tl(formatCurrency(calculateSubtotal()))}
            </span>
          </div>
          {discount > 0 && (
            <div className="create_invoice_summary_row">
              <span className="create_invoice_summary_label">
                {tx("auto.discount_a89c")}{tl(discount)}%)
              </span>
              <span className="create_invoice_summary_value">
                -{tl(formatCurrency(calculateDiscountAmount()))}
              </span>
            </div>
          )}
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">
              {tx("auto.tax_9cb7")}{tl(taxRate)}%)
            </span>
            <span className="create_invoice_summary_value">
              {tl(formatCurrency(calculateTaxAmount()))}
            </span>
          </div>
          <div className="create_invoice_summary_row create_invoice_summary_total">
            <span className="create_invoice_summary_label">{tx("auto.total_b259")}</span>
            <span className="create_invoice_summary_value create_invoice_total_amount">
              {tl(formatCurrency(calculateTotal()))}
            </span>
          </div>
          <div className="create_invoice_summary_row">
            <span className="create_invoice_summary_label">{tl("Amount Paid")}</span>
            <span className="create_invoice_summary_value">
              -{tl(formatCurrency(calculateAmountPaid()))}
            </span>
          </div>
          <div className="create_invoice_summary_row create_invoice_summary_total">
            <span className="create_invoice_summary_label">{tl("Balance Due")}</span>
            <span className="create_invoice_summary_value create_invoice_total_amount">
              {tl(formatCurrency(calculateBalanceDue()))}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="create_invoice_error">
            <p>{tl(errors.submit)}</p>
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
            ? tx("auto.saving_ae7e")
            : isEditMode
            ? tx("auto.updateInvoice_b9ad")
            : tx("auto.createInvoice_3281")}
        </Button>
      </form>
    </div>
  );
};

export default CreateInvoicePanel;
