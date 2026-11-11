/**
 * paystack.js
 *
 * Paystack checkout using their inline JS (popup). The public key is safe in the
 * browser. After a successful payment we go to the callback page, which asks the
 * backend to verify with Paystack before the plan is activated.
 */

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
}

/**
 * Open the Paystack popup.
 *
 * @param {Object} paymentData  same fields as initiateFlutterwavePayment
 * @param {string} paymentData.email
 * @param {string} paymentData.name
 * @param {string} paymentData.phone
 * @param {string} paymentData.plantype
 * @param {number} paymentData.planPrice  in Naira
 * @param {"monthly"|"yearly"} [paymentData.billingCycle="monthly"]
 * @param {string} paymentData.userId
 * @param {string} [paymentData.callbackPath="/subscription/callback"] page to return to
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function initiatePaystackPayment(paymentData) {
  try {
    const { email, name, phone, plantype, planPrice, userId } = paymentData;
    const billingCycle = paymentData.billingCycle === "yearly" ? "yearly" : "monthly";

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) throw new Error("Paystack isn't set up yet. Please pay with Flutterwave.");

    await loadPaystackScript();

    const plan = String(plantype || "GROWTH").toUpperCase();
    // Paystack references may only contain letters, numbers, "-", "." and "=". "-" separates the
    // parts, and the backend finds the account from the email in metadata, so anything else becomes ".".
    const userKey = String(userId || email || "user")
      .replace(/-/g, "_")
      .replace(/[^A-Za-z0-9_.=]/g, ".");
    // Same format as Flutterwave so the backend can map the account + plan
    const reference = `subscription-${userKey}-${plan}-${Date.now()}`;
    const callbackUrl = `${window.location.origin}${paymentData.callbackPath || "/subscription/callback"}`;

    return new Promise((resolve) => {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(Number(planPrice) * 100), // kobo
        currency: "NGN",
        ref: reference,
        channels: ["card", "bank", "ussd", "bank_transfer"],
        metadata: {
          userId: userId || "",
          email: email || "",
          name: name || "",
          phone: phone || "",
          plantype: plan,
          billingCycle,
          custom_fields: [
            { display_name: "Plan", variable_name: "plan", value: `${plan} (${billingCycle})` },
          ],
        },
        callback: (response) => {
          localStorage.setItem("pending_plan", plan);
          localStorage.setItem("pending_cycle", billingCycle);
          localStorage.setItem("payment_gateway", "paystack");
          localStorage.setItem("pending_tx_ref", response.reference || reference);
          const params = new URLSearchParams({
            gateway: "paystack",
            status: "completed",
            reference: response.reference || reference,
          });
          window.location.href = `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}${params.toString()}`;
          resolve({ success: true });
        },
        onClose: () => resolve({ success: false, message: "Payment window closed" }),
      });
      handler.openIframe();
    });
  } catch (error) {
    console.error("Paystack error:", error);
    return { success: false, message: error.message };
  }
}

/** True when a Paystack public key is set for this build. */
export const paystackEnabled = () => Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
