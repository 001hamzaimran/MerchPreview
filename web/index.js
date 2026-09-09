// @ts-check
import "./Utils/polyfill.js";
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import connectDB from "./Utils/db.js";
import productsRouter from "./Routes/Products.routes.js";
import settingsRouter from "./Routes/Settings.routes.js";
import configurationRouter from "./Routes/Configuration.routes.js";
import themesRouter from "./Routes/Themes.routes.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Enforce HTTPS in production behind reverse proxies
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Connect MongoDB database
connectDB();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", async (req, res, next) => {
  try {
    return await shopify.validateAuthenticatedSession()(req, res, next);
  } catch (err) {
    console.error("Session validation error:", err.message);
    return res.status(403).json({ error: "Session invalid or reauthorization required" });
  }
});

app.use(express.json());

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/configurations", configurationRouter);
app.use("/api/themes", themesRouter);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
