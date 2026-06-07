import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    chapterCode: {
      type: String,
      default: "",
      trim: true
    },
    focusTopics: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

moduleSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const Module = mongoose.model("Module", moduleSchema);
