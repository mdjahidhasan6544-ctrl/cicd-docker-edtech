import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ""
    },
    ip: {
      type: String,
      default: ""
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

deviceSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });

export const Device = mongoose.model("Device", deviceSchema);
