import { GET_MAIN_THEME } from "../GraphQL/Queries/GetThemes.graphql.js";
import shopify from "../shopify.js";

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
