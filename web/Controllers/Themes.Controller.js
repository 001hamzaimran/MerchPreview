import { GET_MAIN_THEME } from "../GraphQL/Queries/GetThemes.graphql.js";
import shopify from "../shopify.js";
import Settings from "../Models/Settings.model.js";

/**
 * GET /api/themes/editor-url
 * Queries Shopify GraphQL API for the published (MAIN) theme of the active store
 * and returns the dynamic Theme Editor URL without any hardcoded IDs.
 */
export const getThemeEditorUrl = async (req, res) => {
  try {
    const session = res.locals?.shopify?.session;
    const shop = session?.shop || req.query?.shop;
    const storeSlug = shop ? shop.replace(".myshopify.com", "") : null;

    let themeId = null;

    if (session) {
      try {
        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.request(GET_MAIN_THEME);
        const mainTheme = response?.data?.themes?.nodes?.[0];
        if (mainTheme?.id) {
          themeId = mainTheme.id.split("/").pop();
        }
      } catch (graphqlErr) {
        console.warn("Could not query published main theme via GraphQL:", graphqlErr.message);
      }
    }

    // Build dynamic editor URL
    let editorUrl = "";
    if (themeId && storeSlug) {
      editorUrl = `https://admin.shopify.com/store/${storeSlug}/themes/${themeId}/editor`;
    } else if (shop) {
      editorUrl = `https://${shop}/admin/themes/current/editor`;
    } else {
      editorUrl = "https://admin.shopify.com";
    }

    res.status(200).json({
      success: true,
      shop,
      storeSlug,
      themeId,
      editorUrl,
    });
  } catch (error) {
    console.error("Error generating dynamic theme editor URL:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/themes/block-status
 * Checks whether the Theme App Block has been added and activated.
 */
export const getBlockStatus = async (req, res) => {
  try {
    const session = res.locals?.shopify?.session;
    const shop = session?.shop || req.query?.shop || "default-shop.myshopify.com";

    const settings = await Settings.findOne({ shop });
    const isBlockAdded = Boolean(settings?.isAppBlockAdded);

    res.status(200).json({
      success: true,
      isBlockAdded,
    });
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/themes/verify-block
 * Marks the Theme App Block as verified in the database.
 */
export const verifyBlock = async (req, res) => {
  try {
    const session = res.locals?.shopify?.session;
    const shop = session?.shop || req.body?.shop || req.query?.shop || "default-shop.myshopify.com";

    const updated = await Settings.findOneAndUpdate(
      { shop },
      { isAppBlockAdded: true },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Theme App Block verified and marked active",
      isBlockAdded: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error verifying block:", error);
    res.status(500).json({ error: error.message });
  }
};
