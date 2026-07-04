import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "MOCKEA is currently undergoing scheduled maintenance. Please check back shortly.",
    },
    featureFlags: {
      aiGrading: { type: Boolean, default: true },
      antiCheatTabSwitch: { type: Boolean, default: true },
      speakingPracticeBeta: { type: Boolean, default: false },
      promoDiscountActive: { type: Boolean, default: false },
    },
    systemNotice: {
      active: { type: Boolean, default: false },
      message: { type: String, default: "" },
      type: { type: String, enum: ["info", "warning", "error"], default: "info" },
    },
  },
  {
    timestamps: true,
  }
);

// We keep a single configuration document in the database
const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
