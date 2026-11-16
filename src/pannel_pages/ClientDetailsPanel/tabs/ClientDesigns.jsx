import { useState, useEffect } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useNewAuth } from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
import { getDesignsByClientId } from "../../../backend/services/crmService";
import "./ClientDesigns.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";

import { dateLocale } from "../../../i18n";


const ClientDesigns = ({ client, onOpenAddDesign, onDesignClick }) => {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch designs for this client
  useEffect(() => {
    if (client?.id && user?.email) {
      loadDesigns();
    }
  }, [client?.id, user?.email]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const designsData = await getDesignsByClientId(client.id, effectiveEmail);
      setDesigns(designsData);
    } catch (error) {
      console.error("Error loading client designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDesign = () => {
    if (onOpenAddDesign) {
      onOpenAddDesign(client);
    }
  };

  const handleDesignClick = (design) => {
    if (onDesignClick) {
      onDesignClick(design);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(dateLocale("en-US"), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₦0";
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="client_details_designs">
        <div className="client_designs_loading">{tx("auto.loadingDesigns_5a80")}</div>
      </div>
    );
  }

  return (
    <div className="client_details_designs">
      {/* Designs Header */}
      <div className="client_designs_header">
        <h3 className="client_designs_count">{tl(designs.length)}{" "}{tx("auto.designs_fdea")}</h3>
        <button className="client_designs_new_btn" onClick={handleNewDesign}>
          <Plus size={18} />
          {tx("auto.newDesign_f4bb")}
        </button>
      </div>

      {/* Designs Grid */}
      {designs.length > 0 ? (
        <div className="client_designs_grid">
          {designs.map((design) => (
            <div
              key={design.id}
              className="client_design_card"
              onClick={() => handleDesignClick(design)}
            >
              <div className="client_design_image_container">
                {design.imageUrl || (design.images && design.images[0]) ? (
                  <img
                    src={design.imageUrl || design.images[0]}
                    alt={design.name}
                    className="client_design_image"
                  />
                ) : (
                  <div className="client_design_no_image">
                    <span>{tx("auto.noImage_33cf")}</span>
                  </div>
                )}
                <div
                  className={`client_design_status_badge ${
                    design.status?.toLowerCase().replace(" ", "_") || "active"
                  }`}
                >
                  {tl(design.status || tx("auto.active_a733"))}
                </div>
              </div>

              <div className="client_design_content">
                <h4 className="client_design_title">{tl(design.name)}</h4>
                <p className="client_design_category">{tl(design.category)}</p>
                <p className="client_design_date">
                  {tl(formatDate(design.createdAt))}
                </p>
                <div className="client_design_footer">
                  <span className="client_design_price">
                    {tl(formatPrice(design.price))}
                  </span>
                  <button className="client_design_arrow_btn">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="client_designs_empty">
          <p>{tx("auto.noDesignsYetForThis_d0de")}</p>
          <button
            className="client_designs_empty_btn"
            onClick={handleNewDesign}
          >
            <Plus size={18} />
            {tx("auto.createFirstDesign_aa40")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDesigns;
