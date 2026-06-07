import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
    level: {
      type: String,
      enum: ["Pre-O Level", "O Level"],
      default: "O Level"
    },
    subject: {
      type: String,
      enum: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
      default: "Mathematics"
    },
    difficulty: {
      type: String,
      default: "Core"
    },
    estimatedHours: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ["free", "paid"],
      required: true
    },
    thumbnail: {
      type: String,
      default: ""
    },
    order: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ order: 1 });
courseSchema.index({ isPublished: 1 });

export const Course = mongoose.model("Course", courseSchema);
