import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import hasValidAccessTokenModule from "@shopify/shopify-app-express/dist/cjs/middlewares/has-valid-access-token.js";

import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const apiMain = require.resolve("@shopify/shopify-api");
const runtimePath = path.resolve(path.dirname(apiMain), "../runtime/http/index.js");
const cjsRuntime = require(runtimePath);

// Helper to cycle a non-expiring offline token to an expiring offline token via token exchange
async function cycleOfflineToken(shop, accessToken) {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || shopify?.api?.config?.apiKey;
    const clientSecret = process.env.SHOPIFY_API_SECRET || shopify?.api?.config?.apiSecretKey;
    if (!clientId || !clientSecret) return null;

    const params = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      client_id: clientId,
      client_secret: clientSecret,
      subject_token: accessToken,
      subject_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
      requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
      expiring: "1",
    });

    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (res.ok) {
      return await res.json();
    } else {
      const errText = await res.text();
      console.warn(`[shopify-app] Token exchange response (${res.status}):`, errText);
    }
  } catch (e) {
    console.warn(`[shopify-app] Token exchange error:`, e.message);
  }
  return null;
}

// Cache validated access tokens for 10 minutes to avoid redundant external GraphQL queries
// on every request, while still detecting expired/invalid tokens and cleaning up stale sessions.
const validatedTokens = new Map();
const origHasValidAccessToken = hasValidAccessTokenModule.hasValidAccessToken;

hasValidAccessTokenModule.hasValidAccessToken = async (api, session) => {
  if (!session?.accessToken) return false;

  const lastValidated = validatedTokens.get(session.accessToken);
  const now = Date.now();
  if (lastValidated && now - lastValidated < 10 * 60 * 1000) {
    return true;
  }

  try {
    const isValid = await origHasValidAccessToken(api, session);
    if (isValid) {
      validatedTokens.set(session.accessToken, now);
    }
    return isValid;
  } catch (error) {
    const isNonExpiringError =
      (error?.response?.code === 403 || error?.networkStatusCode === 403) &&
      error?.message?.includes("Non-expiring access tokens are no longer accepted");

    if (isNonExpiringError) {
      console.log(`[shopify-app] Detected non-expiring token for ${session.shop}, cycling to expiring token...`);
      const cycled = await cycleOfflineToken(session.shop, session.accessToken);
      if (cycled?.access_token) {
        session.accessToken = cycled.access_token;
        if (cycled.expires_in) {
          session.expires = new Date(Date.now() + cycled.expires_in * 1000);
        }
        await shopify?.config?.sessionStorage?.storeSession(session);
        validatedTokens.set(session.accessToken, now);
        console.log(`[shopify-app] Successfully cycled token for ${session.shop} to expiring offline token!`);
        return true;
      }
    }

    if (
      error?.response?.code === 401 ||
      error?.response?.status === 401 ||
      error?.networkStatusCode === 401 ||
      error?.message?.includes("401 Unauthorized") ||
      isNonExpiringError
    ) {
      validatedTokens.delete(session.accessToken);
      if (session?.id) {
        try {
          await shopify?.config?.sessionStorage?.deleteSession(session.id);
          console.warn(`[shopify-app] Purged invalid/expired session for ${session.shop}`);
        } catch (_) {}
      }
      return false;
    }
    // For non-401 transient issues (network glitch, rate limit), avoid falling into an OAuth loop
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

// Intercept OAuth authorization code exchange in CJS runtime to request expiring offline access tokens (Shopify 2026 requirement)
const origCjsFetch = cjsRuntime.abstractFetch;
cjsRuntime.setAbstractFetchFunc(async (url, options) => {
  if (typeof url === "string" && url.includes("/admin/oauth/access_token") && options?.body) {
    try {
      const parsed = JSON.parse(options.body);
      if (parsed.code && parsed.expiring === undefined) {
        parsed.expiring = 1;
        options.body = JSON.stringify(parsed);
        console.log("[shopify-app] Injected expiring: 1 into OAuth authorization code exchange");
      }
    } catch (_) {}
  }
  return await origCjsFetch(url, options);
});

// Auto-migrate any existing non-expiring tokens on startup
setTimeout(async () => {
  try {
    const sqlite3 = require("sqlite3");
    const db = new sqlite3.Database(DB_PATH);
    db.all("SELECT id, shop, accessToken FROM shopify_sessions WHERE expires IS NULL", async (err, rows) => {
      if (err || !rows?.length) return;
      for (const row of rows) {
        console.log(`[shopify-app] Found non-expiring session for ${row.shop}. Cycling via token exchange...`);
        const cycled = await cycleOfflineToken(row.shop, row.accessToken);
        if (cycled?.access_token) {
          const session = await shopify.config.sessionStorage.loadSession(row.id);
          if (session) {
            session.accessToken = cycled.access_token;
            if (cycled.expires_in) {
              session.expires = new Date(Date.now() + cycled.expires_in * 1000);
            }
            await shopify.config.sessionStorage.storeSession(session);
            console.log(`[shopify-app] Successfully cycled token for ${row.shop} to expiring offline token! Expires in: ${cycled.expires_in}s`);
          }
        } else {
          console.warn(`[shopify-app] Unable to cycle token for ${row.shop}, purging stale session so re-auth occurs.`);
          await shopify.config.sessionStorage.deleteSession(row.id);
        }
      }
    });
  } catch (e) {
    console.warn("[shopify-app] Auto-cycle startup error:", e.message);
  }
}, 500);

export default shopify;
