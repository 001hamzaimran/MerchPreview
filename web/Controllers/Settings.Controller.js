import Settings from "../Models/Settings.model.js";

/**
 * GET /api/settings
 * Retrieves Cloudinary keys and settings strictly scoped to the store session
 */
export const getSettings = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.query?.shop;

    if (!shop) {
      return res.status(200).json({
        cloudName: "",
        apiKey: "",
        apiSecret: "",
        uploadFolder: "merchpreview_custom_designs",
        autoValidateDpi: true,
        autoSaveCanvas: true,
      });
    }

    let settings = await Settings.findOne({ shop });

    if (!settings) {
      settings = {
        shop,
        cloudName: "",
        apiKey: "",
        apiSecret: "",
        uploadFolder: "merchpreview_custom_designs",
        autoValidateDpi: true,
        autoSaveCanvas: true,
        isAppBlockAdded: false,
      };
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/settings
 * Saves or updates Cloudinary keys and store settings strictly scoped to the store session
 */
export const saveSettings = async (req, res) => {
  try {
    const shop = res.locals?.shopify?.session?.shop || req.body?.shop || req.query?.shop;

    if (!shop) {
      return res.status(400).json({ error: "Shop session is required" });
    }

    const {
      cloudName,
      apiKey,
      apiSecret,
      uploadFolder,
      autoValidateDpi,
      autoSaveCanvas,
    } = req.body;

    const updated = await Settings.findOneAndUpdate(
      { shop },
      {
        shop,
        cloudName: cloudName ?? "",
        apiKey: apiKey ?? "",
        apiSecret: apiSecret ?? "",
        uploadFolder: uploadFolder || "merchpreview_custom_designs",
        autoValidateDpi: autoValidateDpi ?? true,
        autoSaveCanvas: autoSaveCanvas ?? true,
      },
      { upsert: true, returnDocument: "after" }
    );

    res.status(200).json({
      success: true,
      message: "Cloudinary settings saved successfully in database",
      data: updated,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: error.message });
  }
};
