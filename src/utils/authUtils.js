import { auth } from "../backend/firebase.config";

/**
 * Get the login type/provider for the current user
 * @returns {Object} Object containing login type information
 */
const getLoginType = () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      type: null,
      provider: null,
      isGoogle: false,
      isEmail: false,
      isPhone: false,
      canChangePassword: false,
      providerData: [],
    };
  }

  // Get provider data from Firebase Auth
  const providerData = currentUser.providerData || [];
  const providers = providerData.map((provider) => provider.providerId);

  // Determine primary login method
  let primaryProvider = null;
  let loginType = null;

  if (providers.includes("google.com")) {
    primaryProvider = "google.com";
    loginType = "google";
  } else if (providers.includes("password")) {
    primaryProvider = "password";
    loginType = "email";
  } else if (providers.includes("phone")) {
    primaryProvider = "phone";
    loginType = "phone";
  }

  return {
    type: loginType,
    provider: primaryProvider,
    isGoogle: loginType === "google",
    isEmail: loginType === "email",
    isPhone: loginType === "phone",
    canChangePassword: loginType === "email", // Only email users can change password
    providerData: providerData,
    allProviders: providers,
    // Additional user info
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    emailVerified: currentUser.emailVerified,
  };
};

/**
 * Get user login method from stored user data
 * @param {Object} user - User object from context
 * @returns {Object} Login type information
 */
export const getLoginTypeFromUserData = (user) => {
  if (!user) {
    return {
      type: null,
      provider: null,
      isGoogle: false,
      isEmail: false,
      isPhone: false,
      canChangePassword: false,
    };
  }

  // Check provider from stored user data
  const provider = user.provider || "email";

  return {
    type: provider,
    provider: provider,
    isGoogle: provider === "google",
    isEmail: provider === "email",
    isPhone: provider === "phone",
    canChangePassword: provider === "email",
    // Additional info from user data
    isPhoneBasedAccount: user.isPhoneBasedAccount || false,
    originalEmail: user.originalEmail,
    originalPhone: user.originalPhone,
  };
};


/**
 * Get a human-readable login method description
 * @param {Object} user - User object from context (optional)
 * @returns {string} Description of login method
 */
export const getLoginMethodDescription = (user = null) => {
  const loginInfo = user ? getLoginTypeFromUserData(user) : getLoginType();

  switch (loginInfo.type) {
    case "google":
      return "Signed in with Google";
    case "email":
      return "Signed in with Email & Password";
    case "phone":
      return "Signed in with Phone Number";
    default:
      return "Unknown login method";
  }
};

