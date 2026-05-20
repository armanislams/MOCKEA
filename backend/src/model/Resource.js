import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    ctaText: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Vocabulary", "Writing Guide", "Speaking Templates", "Study Tips", "General"],
      default: "General",
    },
    fileType: {
      type: String,
      required: true,
      default: "PDF",
    },
    size: {
      type: String,
      default: "Unknown size",
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
