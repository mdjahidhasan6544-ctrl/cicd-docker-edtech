import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    meetLink: {
      type: String,
      default: ""
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    recordingUrl: {
      type: String,
      default: ""
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

liveClassSchema.index({ scheduledAt: 1 });

export const LiveClass = mongoose.model("LiveClass", liveClassSchema);
