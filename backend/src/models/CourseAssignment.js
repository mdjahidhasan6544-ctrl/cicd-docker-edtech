import mongoose from "mongoose";

const courseAssignmentSchema = new mongoose.Schema(
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
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

courseAssignmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseAssignment = mongoose.model(
  "CourseAssignment",
  courseAssignmentSchema
);
