import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    institution: {
      type: String,
      default: "",
      trim: true
    },
    classLevel: {
      type: String,
      default: "",
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    isVerifiedStudent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "active", "banned", "temp_banned"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
