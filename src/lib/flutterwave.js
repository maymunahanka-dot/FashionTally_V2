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

    const txRef = `subscription-${userId || email}-${Date.now()}`;
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
        customizations: {
          title:       "FashionTally Subscription",
          description: `${plantype} Plan — Monthly`,
          logo:        "https://www.fashiontally.com/favicon.ico",
        },
        callback: (response) => {
          console.log("Flutterwave callback:", response);
          if (response.status === "successful" || response.status === "completed") {
            // Save plan + gateway so callback page knows
            localStorage.setItem("pending_plan",    plantype);
            localStorage.setItem("payment_gateway", "flutterwave");
            // Flutterwave redirect_url handles navigation automatically
            resolve({ success: true });
          } else {
            resolve({ success: false, message: "Payment was not completed" });
          }
        },
        onclose: () => {
          resolve({ success: false, message: "Payment window closed" });
        },
      });
    });
  } catch (error) {
    console.error("Flutterwave error:", error);
    return { success: false, message: error.message };
  }
}
