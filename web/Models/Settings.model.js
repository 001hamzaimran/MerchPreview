import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cloudName: {
      type: String,
      default: "",
    },
    apiKey: {
      type: String,
      default: "",
    },
    apiSecret: {
      type: String,
      default: "",
    },
    uploadFolder: {
      type: String,
      default: "merchpreview_custom_designs",
    },
    autoValidateDpi: {
      type: Boolean,
      default: true,
    },
    autoSaveCanvas: {
      type: Boolean,
      default: true,
    },
    isAppBlockAdded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
export default Settings;
