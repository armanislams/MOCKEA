import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  { timestamps: true }
);

trainerSchema.index({ email: 1 });
trainerSchema.index({ specialty: 1 });

const Trainer = mongoose.model("Trainer", trainerSchema);
export default Trainer;
