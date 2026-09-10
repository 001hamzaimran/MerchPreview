import mongoose from "mongoose";

const ConfigurationSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productTitle: {
      type: String,
      default: "",
    },
    productImage: {
      type: String,
      default: "",
    },
    imageId: {
      type: String,
      default: "",
    },
    imageTitle: {
      type: String,
      default: "Front View",
    },
    printArea: {
      x: { type: Number, default: 0.25 },
      y: { type: Number, default: 0.20 },
      width: { type: Number, default: 0.50 },
      height: { type: Number, default: 0.40 },
    },
    printAreas: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    settings: {
      enabled: { type: Boolean, default: true },
      acceptedFormats: { type: [String], default: ["png", "jpg", "webp", "svg"] },
      maxFileSize: { type: Number, default: 10 },
      previewButtonText: { type: String, default: "Preview Design" },
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Configuration = mongoose.models.Configuration || mongoose.model("Configuration", ConfigurationSchema);
export default Configuration;
