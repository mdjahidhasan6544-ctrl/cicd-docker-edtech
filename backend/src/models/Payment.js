import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket"],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
