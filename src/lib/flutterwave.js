/**
 * flutterwave.js
 *
 * Flutterwave payment integration using their inline JS SDK.
 * The public key is safe to use in the browser.
 * Redirects to the callback page on success, same as Cash on Rails.
 */

/**
 * Load the Flutterwave inline script dynamically (once)
 */
function loadFlutterwaveScript() {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload  = resolve;
    script.onerror = () => reject(new Error("Failed to load Flutterwave SDK"));
    document.head.appendChild(script);
  });
}

/**
 * Initiate a Flutterwave payment popup.
 *
 * @param {Object} paymentData
 * @param {string} paymentData.email
 * @param {string} paymentData.name
 * @param {string} paymentData.phone
 * @param {string} paymentData.plantype
 * @param {number} paymentData.planPrice
 * @param {string} paymentData.userId
 *
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function initiateFlutterwavePayment(paymentData) {
  try {
    const { email, name, phone, plantype, planPrice, userId } = paymentData;

    const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) throw new Error("Flutterwave public key not configured");

    await loadFlutterwaveScript();

    const plan = String(plantype || "GROWTH").toUpperCase();
    const userKey = String(userId || email || "user").replace(/-/g, "_");
    // Format: subscription-{userKey}-{PLAN}-{timestamp} so webhook/verify can map the account + plan
    const txRef = `subscription-${userKey}-${plan}-${Date.now()}`;
    const callbackUrl = `${window.location.origin}/subscription/callback`;

    return new Promise((resolve) => {
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref:     txRef,
        amount:     planPrice,
        currency:   "NGN",
        payment_options: "card,ussd,bank_transfer",
        redirect_url: callbackUrl,
        customer: {
          email,
          phone_number: phone,
          name,
        },
        meta: {
          userId: userId || "",
          email: email || "",
          plantype: plan,
        },
        customizations: {
          title:       "FashionTally Subscription",
          description: `${plan} Plan — Monthly`,
          logo:        "https://www.fashiontally.com/favicon.ico",
        },
        callback: (response) => {
          console.log("Flutterwave callback:", response);
          const ok =
            response.status === "successful" ||
            response.status === "completed" ||
            response.status === "success";

          localStorage.setItem("pending_plan", plantype);
          localStorage.setItem("payment_gateway", "flutterwave");
          localStorage.setItem("pending_tx_ref", txRef);
          localStorage.setItem(
            "pending_payment_status",
            ok ? "completed" : String(response.status || "failed")
          );
          if (response.transaction_id) {
            localStorage.setItem("pending_transaction_id", String(response.transaction_id));
          }

          if (ok) {
            // Force web callback. Use status=completed — Flutterwave redirect often uses that.
            const params = new URLSearchParams({
              status: "completed",
              tx_ref: txRef,
              transaction_id: String(response.transaction_id || ""),
            });
            window.location.href = `${callbackUrl}?${params.toString()}`;
            resolve({ success: true });
          } else {
            resolve({ success: false, message: "Payment was not completed" });
          }
        },
        onclose: () => {
          // If they paid then closed, webhook still activates on the server.
          resolve({ success: false, message: "Payment window closed" });
        },
      });
    });
  } catch (error) {
    console.error("Flutterwave error:", error);
    return { success: false, message: error.message };
  }
}
