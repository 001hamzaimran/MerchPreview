import Configuration from "../Models/Configuration.model.js";

/**
 * GET /api/configurations
 * Retrieves all saved product configurations for the store
 */
export const getConfigurations = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop || "default-shop.myshopify.com";
    const configs = await Configuration.find({ shop }).sort({ updatedAt: -1 });
    res.status(200).json(configs);
  } catch (error) {
    console.error("Error fetching configurations:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/configurations/:productId
 * Retrieves configuration for a single product
 */
export const getConfigurationByProduct = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop || "default-shop.myshopify.com";
    const { productId } = req.params;
    const config = await Configuration.findOne({ shop, productId });
    res.status(200).json(config);
  } catch (error) {
    console.error("Error fetching product configuration:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/configurations
 * Saves or updates a product configuration in MongoDB
 */
export const saveConfiguration = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.body?.shop || "default-shop.myshopify.com";
    const {
      productId,
      productTitle,
      productImage,
      imageId,
      imageTitle,
      printArea,
      settings,
      status,
    } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const updated = await Configuration.findOneAndUpdate(
      { shop, productId },
      {
        shop,
        productId,
        productTitle,
        productImage,
        imageId,
        imageTitle,
        printArea,
        settings,
        status: status || "Active",
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product configuration saved in database",
      data: updated,
    });
  } catch (error) {
    console.error("Error saving configuration:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/configurations/:id
 * Deletes a configuration by ID
 */
export const deleteConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    await Configuration.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Configuration deleted from database" });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    res.status(500).json({ error: error.message });
  }
};
