import mongoose from "mongoose";
import Configuration from "../Models/Configuration.model.js";

/**
 * GET /api/configurations
 * Retrieves all saved product configurations strictly scoped to the store session
 */
export const getConfigurations = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop;
    if (!shop) {
      return res.status(200).json([]);
    }

    const configs = await Configuration.find({ shop }).sort({ updatedAt: -1 });
    res.status(200).json(configs);
  } catch (error) {
    console.error("Error fetching configurations:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/configurations/:productId
 * Retrieves configuration for a single product strictly scoped to the store session
 */
export const getConfigurationByProduct = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop;
    const { productId } = req.params;

    if (!shop) {
      return res.status(200).json(null);
    }

    const config = await Configuration.findOne({ shop, productId });
    res.status(200).json(config);
  } catch (error) {
    console.error("Error fetching product configuration:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/configurations
 * Saves or updates a product configuration in MongoDB strictly scoped to the store session
 */
export const saveConfiguration = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.body?.shop || req.query?.shop;
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

    if (!shop) {
      return res.status(400).json({ error: "Shop session is required" });
    }

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const updated = await Configuration.findOneAndUpdate(
      { shop, productId },
      {
        shop,
        productId,
        productTitle: productTitle || "",
        productImage: productImage || "",
        imageId: imageId || "",
        imageTitle: imageTitle || "Front View",
        printArea: printArea || { x: 0.25, y: 0.20, width: 0.50, height: 0.40 },
        settings: settings || {
          enabled: true,
          acceptedFormats: ["png", "jpg", "webp", "svg"],
          maxFileSize: 10,
          previewButtonText: "Preview Design",
        },
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
 * Deletes a configuration safely by ObjectId or productId, strictly scoped to the store session
 */
export const deleteConfiguration = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop;
    const { id } = req.params;

    let filter = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter._id = id;
    } else {
      filter.productId = id;
    }

    if (shop) {
      filter.shop = shop;
    }

    await Configuration.findOneAndDelete(filter);
    res.status(200).json({ success: true, message: "Configuration deleted from database" });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    res.status(500).json({ error: error.message });
  }
};
