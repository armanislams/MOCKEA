import mongoose from "mongoose";

const bookingSlotSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "booked", "completed"],
      default: "available",
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    studentNotes: {
      type: String,
      trim: true,
      default: "",
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes to speed up lookups and prevent collisions
bookingSlotSchema.index({ instructor: 1, startTime: 1 });
bookingSlotSchema.index({ status: 1 });

const BookingSlot = mongoose.model("BookingSlot", bookingSlotSchema);
export default BookingSlot;
