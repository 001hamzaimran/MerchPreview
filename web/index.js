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
import { verifyBlock } from "./Controllers/Themes.Controller.js";
import Configuration from "./Models/Configuration.model.js";
import Settings from "./Models/Settings.model.js";
import { v2 as cloudinary } from "cloudinary";
import { GETPRODUCTS } from "./GraphQL/Queries/GetProducts.graphql.js";

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
app.set('trust proxy', true)

// CORS support for custom API
app.use("/customapi/*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// @ts-ignore
async function authenticateUser(req, res, next) {
  let shop = req.query.shop || req.body?.shop;
  console.log("Shop for view", shop);
  if (!shop) {
    return res.status(401).json({ error: "User is not Authorized: missing shop parameter" });
  }

  shop = String(shop).trim().replace(/^["']|["']$/g, "");
  if (!shop.includes(".") && !shop.includes(".myshopify.com")) {
    shop = `${shop}.myshopify.com`;
  }

  let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  console.log("storename for view", storeName);
  if (storeName && storeName.length > 0) {
    res.locals.shopify = { session: storeName[0] };
    next();
  } else {
    res.status(401).json({ error: "User is not Authorized" });
  }
}

app.use("/api/*", async (req, res, next) => {
  try {
    return await shopify.validateAuthenticatedSession()(req, res, next);
  } catch (err) {
    console.error("Session validation error:", err.message);
    return res.status(403).json({ error: "Session invalid or reauthorization required" });
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/customapi/*", authenticateUser);
// API Routes
app.use("/api/products", productsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/configurations", configurationRouter);
app.use("/api/themes", themesRouter);

app.get('/customapi/getallproducts', async (req, res) => {
  try {
    const session = res.locals?.shopify?.session;
    const shop = session?.shop || req.query.shop;

    // Fetch saved configurations from MongoDB for this shop
    const filter = { status: { $ne: "Draft" } };
    if (shop) filter.shop = shop;
    const configs = await Configuration.find(filter).lean();

    const configMap = new Map();
    const configuredProductIds = [];
    for (const c of configs) {
      if (c.productId) {
        configuredProductIds.push(c.productId);
        const cleanId = String(c.productId).replace(/^gid:\/\/shopify\/Product\//, "");
        configMap.set(c.productId, c);
        configMap.set(cleanId, c);
      }
    }

    let products = [];
    if (session) {
      const client = new shopify.api.clients.Graphql({ session });
      const response = await client.request(GETPRODUCTS);
      const rawProducts = response?.data?.products?.nodes || [];

      products = rawProducts.map((p) => {
        const cleanId = String(p.id).replace(/^gid:\/\/shopify\/Product\//, "");
        const cfg = configMap.get(p.id) || configMap.get(cleanId);
        return {
          ...p,
          isConfigured: !!cfg,
          configuration: cfg || null,
        };
      });
    }

    return res.status(200).json({
      success: true,
      products,
      configuredProductIds,
      configurations: configs,
    });
  } catch (err) {
    console.error("Error in /customapi/getallproducts:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/customapi/configuration', async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query.shop;
    const productId = req.query.productId;
    if (!productId) {
      return res.status(400).json({ success: false, error: "Missing productId" });
    }

    const cleanId = String(productId).replace(/^gid:\/\/shopify\/Product\//, "");
    const filter = {
      $or: [
        { productId: productId },
        { productId: cleanId },
        { productId: `gid://shopify/Product/${cleanId}` },
      ],
      status: { $ne: "Draft" },
    };
    if (shop) filter.shop = shop;

    const config = await Configuration.findOne(filter).lean();
    return res.status(200).json({
      success: true,
      isConfigured: !!config,
      configuration: config || null,
    });
  } catch (err) {
    console.error("Error in /customapi/configuration:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/customapi/verify-block", verifyBlock);
app.get("/customapi/verify-block", verifyBlock);

app.post("/customapi/upload-design", async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.body?.shop || req.query?.shop;
    const { artwork, mockup, artworkName } = req.body;

    if (!artwork) {
      return res.status(400).json({ success: false, error: "Artwork image data is required" });
    }

    // Retrieve Cloudinary settings for the shop
    let filter = {};
    if (shop) filter.shop = shop;
    let settings = await Settings.findOne(filter).lean();
    if (!settings || !settings.cloudName || !settings.apiKey || !settings.apiSecret) {
      settings = await Settings.findOne({ cloudName: { $ne: "" } }).lean();
    }

    if (!settings || !settings.cloudName || !settings.apiKey || !settings.apiSecret) {
      return res.status(400).json({
        success: false,
        error: "Cloudinary is not configured. Please enter your Cloudinary credentials in the app settings.",
      });
    }

    cloudinary.config({
      cloud_name: settings.cloudName,
      api_key: settings.apiKey,
      api_secret: settings.apiSecret,
      secure: true,
    });

    const baseFolder = settings.uploadFolder || "merchpreview_custom_designs";
    const timestamp = Date.now();
    const safeName = (artworkName || "artwork").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);

    const uploadPromises = [
      cloudinary.uploader.upload(artwork, {
        folder: `${baseFolder}/artwork`,
        resource_type: "auto",
        public_id: `${safeName}_${timestamp}`,
      }),
    ];

    if (mockup) {
      uploadPromises.push(
        cloudinary.uploader.upload(mockup, {
          folder: `${baseFolder}/mockups`,
          resource_type: "image",
          public_id: `mockup_${timestamp}`,
        })
      );
    }

    const [artworkRes, mockupRes] = await Promise.all(uploadPromises);

    const artworkUrl = artworkRes?.secure_url || artworkRes?.url || "";
    const mockupUrl = mockupRes?.secure_url || mockupRes?.url || artworkUrl;

    console.log("[Cloudinary Upload] Success:", { artworkUrl, mockupUrl });

    return res.status(200).json({
      success: true,
      artworkUrl,
      mockupUrl,
    });
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

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
