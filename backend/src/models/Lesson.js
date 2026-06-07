import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    contentType: {
      type: String,
      enum: ["youtube", "google_doc", "pdf", "pptx"],
      default: "youtube"
    },
    youtubeId: {
      type: String,
      default: "",
      trim: true
    },
    resourceUrl: {
      type: String,
      default: "",
      trim: true
    },
    duration: {
      type: String,
      default: ""
    },
    topic: {
      type: String,
      default: "",
      trim: true
    },
    learningObjectives: {
      type: [String],
      default: []
    },
    summary: {
      type: String,
      default: ""
    },
    exampleProblem: {
      type: String,
      default: ""
    },
    practiceHint: {
      type: String,
      default: ""
    },
    notesUrl: {
      type: String,
      default: "",
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

lessonSchema.index({ moduleId: 1, order: 1 }, { unique: true });

export const Lesson = mongoose.model("Lesson", lessonSchema);
