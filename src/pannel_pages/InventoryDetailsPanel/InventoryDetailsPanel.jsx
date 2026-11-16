import { useState, useEffect, useContext } from "react";
import {
  X,
  Package,
  Calendar,
  User,
  DollarSign,
  Hash,
  Palette,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import { formatForeign, getNgnPerUnit } from "../../utils/exchangeRate";
import "./InventoryDetailsPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";


const InventoryDetailsPanel = ({ onClose, selectedItem }) => {
  const { t: tx } = useTranslation();
  const { user } = useContext(NewAuthContext);
  const [showDollars, setShowDollars] = useState(false);
  const [usdToNgn, setUsdToNgn] = useState(null); // Naira per 1 unit of secCurrency
  const [secCurrency, setSecCurrency] = useState("USD");

  useEffect(() => {
    const email = getEffectiveUserEmail(user);
    if (!email) return;
    let cancelled = false;

    const loadCurrency = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/brand-setting/get-by-email/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        const cur = String(data?.data?.inventoryCurrency || "NGN").toUpperCase();
        const useDollars = cur !== "NGN"; // name kept: true for any non-Naira display currency
        if (cancelled) return;
        setShowDollars(useDollars);
        setSecCurrency(useDollars ? cur : "USD");
        setUsdToNgn(await getNgnPerUnit(useDollars ? cur : "USD"));
      } catch (error) {
        console.error("Error loading exchange rate:", error);
      }
    };

    loadCurrency();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!selectedItem) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Stock":
        return (
          <CheckCircle
            className="inventory_detail_status_icon inventory_detail_status_in_stock"
            size={20}
          />
        );
      case "Low Stock":
        return (
          <AlertTriangle
            className="inventory_detail_status_icon inventory_detail_status_low_stock"
            size={20}
          />
        );
      case "Out of Stock":
        return (
          <XCircle
            className="inventory_detail_status_icon inventory_detail_status_out_stock"
            size={20}
          />
        );
      default:
        return <Package className="inventory_detail_status_icon" size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "inventory_detail_status_badge_in_stock";
      case "Low Stock":
        return "inventory_detail_status_badge_low_stock";
      case "Out of Stock":
        return "inventory_detail_status_badge_out_stock";
      default:
        return "inventory_detail_status_badge_default";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString(dateLocale("en-US"), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  /** Saved Naira amount shown only in the Brand currency. */
  const money = (naira) =>
    showDollars && usdToNgn ? formatForeign(naira, usdToNgn, secCurrency) : formatCurrency(naira);

  const totalValue = selectedItem.price * selectedItem.quantity;
  const suppliers = selectedItem.suppliers?.some((entry) => entry?.name || entry?.contact)
    ? selectedItem.suppliers.filter((entry) => entry?.name || entry?.contact)
    : (selectedItem.supplierName || selectedItem.supplier)
      ? [{ name: selectedItem.supplierName || selectedItem.supplier, contact: "" }]
      : [];

  return (
    <div className="inventory_detail_panel">
      {/* Header */}
      <div className="inventory_detail_header">
        <button className="inventory_detail_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="inventory_detail_title_section">
          <h2 className="inventory_detail_title">{tl(selectedItem.name)}</h2>
          <p className="inventory_detail_subtitle">
            {tx("auto.sku_92c9")}{" "}{tl(selectedItem.sku || selectedItem.code)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="inventory_detail_content">
        <div className={`inventory_detail_hero ${selectedItem.imageUrl ? "has_image" : ""}`}>
          {selectedItem.imageUrl && (
            <div className="inventory_detail_image_wrap">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="inventory_detail_image"
              />
            </div>
          )}

        {/* Status Section */}
        <div className="inventory_detail_section inventory_detail_hero_side">
          <div className="inventory_detail_section_header">
            {tl(getStatusIcon(selectedItem.status))}
            <h3 className="inventory_detail_section_title">{tx("auto.status_bae7")}</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div
              className={`inventory_detail_status_badge ${getStatusClass(
                selectedItem.status
              )}`}
            >
              {tl(selectedItem.status)}
            </div>
            {selectedItem.status === "Low Stock" && (
              <p className="inventory_detail_status_description">
                {tx("auto.stockLevelIsBelowThe_08b8")}
              </p>
            )}
            {selectedItem.status === "Out of Stock" && (
              <p className="inventory_detail_status_description">
                {tx("auto.thisItemIsCurrentlyOut_ba04")}
              </p>
            )}
          </div>
        </div>
        </div>

        {/* Basic Information */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Package size={20} />
            <h3 className="inventory_detail_section_title">{tx("auto.itemDetails_c209")}</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_info_grid">
              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <Hash size={16} />
                  {tx("auto.sku_d591")}
                </div>
                <div className="inventory_detail_info_value">
                  {tl(selectedItem.sku || selectedItem.code)}
                </div>
              </div>

              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <Package size={16} />
                  {tx("auto.category_a3c6")}
                </div>
                <div className="inventory_detail_info_value">
                  {tl(selectedItem.category)}
                  {selectedItem.subcategory && (
                    <span className="inventory_detail_subcategory">
                      {" "}
                      • {tl(selectedItem.subcategory)}
                    </span>
                  )}
                </div>
              </div>

              <div className="inventory_detail_info_item inventory_detail_suppliers">
                <div className="inventory_detail_info_label">
                  <User size={16} />
                  {tl(suppliers.length > 1 ? tx("auto.suppliers_6f76") : tx("auto.supplier_55ed"))}
                </div>
                <div className="inventory_detail_supplier_list">
                  {suppliers.length === 0 && (
                    <div className="inventory_detail_info_value">N/A</div>
                  )}
                  {suppliers.map((entry, index) => (
                    <div className="inventory_detail_supplier_card" key={`${entry.name}-${index}`}>
                      <div className="inventory_detail_info_value">{tl(entry.name || tx("auto.unnamedSupplier_f697"))}</div>
                      {entry.contact ? (
                        <div className="inventory_detail_supplier_contact">{tl(entry.contact)}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <DollarSign size={16} />
                  {tx("auto.unitPrice_1eea")}
                </div>
                <div className="inventory_detail_info_value">
                  {tl(money(selectedItem.price || selectedItem.pricePerUnit))}
                </div>
              </div>

              {selectedItem.color && (
                <div className="inventory_detail_info_item">
                  <div className="inventory_detail_info_label">
                    <Palette size={16} />
                    {tx("auto.color_1d0c")}
                  </div>
                  <div className="inventory_detail_info_value">
                    {tl(selectedItem.color)}
                  </div>
                </div>
              )}
            </div>

            {selectedItem.description && (
              <div className="inventory_detail_description">
                <div className="inventory_detail_info_label">
                  <FileText size={16} />
                  {tx("auto.description_55f8")}
                </div>
                <div className="inventory_detail_info_value inventory_detail_description_text">
                  {tl(selectedItem.description)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock Information */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Package size={20} />
            <h3 className="inventory_detail_section_title">
              {tx("auto.stockInformation_ae08")}
            </h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_stock_grid">
              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value">
                  {tl(selectedItem.quantity)}
                </div>
                <div className="inventory_detail_stock_label">
                  {tx("auto.currentStock_3609")}
                </div>
                <div className="inventory_detail_stock_unit">
                  {tl(selectedItem.unit)}
                </div>
              </div>

              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value inventory_detail_reorder_value">
                  {tl(selectedItem.reorderPoint || selectedItem.minStock)}
                </div>
                <div className="inventory_detail_stock_label">
                  {tx("auto.reorderPoint_4f32")}
                </div>
                <div className="inventory_detail_stock_unit">
                  {tl(selectedItem.unit)}
                </div>
              </div>

              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value inventory_detail_total_value">
                  {tl(money(totalValue))}
                </div>
                <div className="inventory_detail_stock_label">{tx("auto.totalValue_4949")}</div>
                <div className="inventory_detail_stock_unit">
                  {tl(selectedItem.quantity)} ×{" "}
                  {tl(showDollars && usdToNgn
                    ? formatForeign(
                        selectedItem.price || selectedItem.pricePerUnit, usdToNgn, secCurrency)
                    : formatCurrency(
                        selectedItem.price || selectedItem.pricePerUnit
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Calendar size={20} />
            <h3 className="inventory_detail_section_title">{tx("auto.timeline_0185")}</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_timeline">
              <div className="inventory_detail_timeline_item">
                <div className="inventory_detail_timeline_label">{tx("auto.created_accf")}</div>
                <div className="inventory_detail_timeline_value">
                  {tl(formatDate(selectedItem.createdAt))}
                </div>
              </div>
              <div className="inventory_detail_timeline_separator"></div>
              <div className="inventory_detail_timeline_item">
                <div className="inventory_detail_timeline_label">
                  {tx("auto.lastUpdated_66f3")}
                </div>
                <div className="inventory_detail_timeline_value">
                  {tl(formatDate(selectedItem.updatedAt))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPanel;
