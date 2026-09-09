import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import hasValidAccessTokenModule from "@shopify/shopify-app-express/dist/cjs/middlewares/has-valid-access-token.js";

// Ensure hasValidAccessToken does not crash the server or trigger infinite OAuth redirect loops
const origHasValidAccessToken = hasValidAccessTokenModule.hasValidAccessToken;
hasValidAccessTokenModule.hasValidAccessToken = async (api, session) => {
  try {
    return await origHasValidAccessToken(api, session);
  } catch (error) {
    console.warn("hasValidAccessToken notice:", error.message);
    // Only 401 Unauthorized indicates the token was revoked/expired
    if (error?.response?.code === 401 || error?.response?.status === 401) {
      return false;
    }
    // For non-401 errors (such as 403 or network issues), do not kick the user into an OAuth loop
    return Boolean(session && session.accessToken);
  }
};

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    scopes: (process.env.SCOPES || "write_products,read_themes")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
});

// Guard against webhook registration failures crashing the entire OAuth callback
const originalRegister = shopify.api.webhooks.register.bind(shopify.api.webhooks);
shopify.api.webhooks.register = async (params) => {
  try {
    return await originalRegister(params);
  } catch (error) {
    console.warn("Non-fatal warning registering webhooks during OAuth:", error.message);
    return {};
  }
};

export default shopify;
