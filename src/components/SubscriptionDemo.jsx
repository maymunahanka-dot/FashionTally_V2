import { SubscriptionGate } from "./SubscriptionGate/SubscriptionGate";
import { useSubscription } from "../hooks/use-subscription";

import { useTranslation } from "react-i18next";
import { t as tx } from "../i18n";

import { tl } from "../i18n";
import { dateLocale } from "../i18n";


export function SubscriptionDemo() {
  const { t: tx } = useTranslation();
  const subscription = useSubscription();

  return (
    <div style={{ padding: "20px" }}>
      <h1>{tx("auto.subscriptionSystemDemo_20d6")}</h1>

      {/* Display current subscription status */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h3>{tx("auto.currentSubscriptionStatus_5303")}</h3>
        <p>
          <strong>{tx("auto.plan_335c")}</strong> {tl(subscription.planType)}
        </p>
        <p>
          <strong>{tx("auto.subscribed_1970")}</strong>{" "}
          {tl(subscription.isSubscribed ? tx("auto.yes_5397") : tx("auto.no_816c"))}
        </p>
        <p>
          <strong>{tx("auto.trialActive_c509")}</strong>{" "}
          {tl(subscription.isTrialActive ? tx("auto.yes_5397") : tx("auto.no_816c"))}
        </p>
        <p>
          <strong>{tx("auto.loading_a60c")}</strong> {tl(subscription.loading ? tx("auto.yes_5397") : tx("auto.no_816c"))}
        </p>
        {subscription.subscriptionEndDate && (
          <p>
            <strong>{tx("auto.endDate_5f0a")}</strong>{" "}
            {new Date(subscription.subscriptionEndDate).toLocaleDateString(dateLocale())}
          </p>
        )}
      </div>

      {/* Example 1: CRM Tools Feature */}
      <div style={{ marginBottom: "32px" }}>
        <h3>{tx("auto.crmToolsDefaultFeature_f135")}</h3>
        <SubscriptionGate requiredFeature="CRM Tools">
          <div
            style={{
              background: "#d4edda",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #c3e6cb",
            }}
          >
            <h4>{tx("auto.crmToolsUnlocked_9075")}</h4>
            <p>{tx("auto.youHaveAccessToAdvanced_e550")}</p>
            <ul>
              <li>{tx("auto.customerRelationshipManagement_d608")}</li>
              <li>{tx("auto.leadTracking_54e9")}</li>
              <li>{tx("auto.communicationHistory_b5ae")}</li>
              <li>{tx("auto.salesPipeline_df5e")}</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Example 2: Inventory Management */}
      <div style={{ marginBottom: "32px" }}>
        <h3>{tx("auto.inventoryManagement_3c40")}</h3>
        <SubscriptionGate requiredFeature="Inventory Tool">
          <div
            style={{
              background: "#d1ecf1",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #bee5eb",
            }}
          >
            <h4>{tx("auto.inventoryManagementUnlocked_f85a")}</h4>
            <p>{tx("auto.youCanNowManageYour_5c58")}</p>
            <ul>
              <li>{tx("auto.stockTracking_c74f")}</li>
              <li>{tx("auto.lowStockAlerts_0186")}</li>
              <li>{tx("auto.productCategorization_ab42")}</li>
              <li>{tx("auto.supplierManagement_efb0")}</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Example 3: Professional Feature */}
      <div style={{ marginBottom: "32px" }}>
        <h3>{tx("auto.prioritySupportProfessionalPlan_ac65")}</h3>
        <SubscriptionGate requiredFeature="Priority Support">
          <div
            style={{
              background: "#fff3cd",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #ffeaa7",
            }}
          >
            <h4>{tx("auto.prioritySupportUnlocked_0b97")}</h4>
            <p>{tx("auto.asAProfessionalPlanMember_4a92")}</p>
            <ul>
              <li>{tx("auto.247PrioritySupport_aba3")}</li>
              <li>{tx("auto.dedicatedAccountManager_2192")}</li>
              <li>{tx("auto.phoneSupport_8cff")}</li>
              <li>{tx("auto.priorityBugFixes_a32c")}</li>
            </ul>
          </div>
        </SubscriptionGate>
      </div>

      {/* Feature Access Testing */}
      <div style={{ marginBottom: "32px" }}>
        <h3>{tx("auto.featureAccessTesting_c589")}</h3>
        <div
          style={{
            background: "#f8f9fa",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>{tx("auto.clientManagement_e6ea")}</strong>{" "}
            {tl(subscription.checkFeature("Client Management")
              ? tx("auto.available_3b72")
              : tx("auto.notAvailable_dbdc"))}
          </p>
          <p>
            <strong>{tx("auto.inventoryTool_00e9")}</strong>{" "}
            {tl(subscription.checkFeature("Inventory Tool")
              ? tx("auto.available_3b72")
              : tx("auto.notAvailable_dbdc"))}
          </p>
          <p>
            <strong>{tx("auto.prioritySupport_618d")}</strong>{" "}
            {tl(subscription.checkFeature("Priority Support")
              ? tx("auto.available_3b72")
              : tx("auto.notAvailable_dbdc"))}
          </p>
          <p>
            <strong>{tx("auto.whiteLabel_f296")}</strong>{" "}
            {tl(subscription.checkFeature("White Label")
              ? tx("auto.available_3b72")
              : tx("auto.notAvailable_dbdc"))}
          </p>
        </div>
      </div>
    </div>
  );
}
