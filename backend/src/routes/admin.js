import { Router } from "express";
import { body, query } from "express-validator";

import {
  assignCourse,
  createCourse,
  createLesson,
  createLiveClass,
  createModule,
  deleteDevice,
  getCourses,
  getDashboardSummary,
  getLiveClasses,
  getPayments,
  getStudents,
  updateCourse,
  updateLiveClass,
  updatePayment,
  updateStudent
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { extractYouTubeId } from "../utils/lessonContent.js";

const router = Router();
const lessonContentTypes = ["youtube", "google_doc", "pdf", "pptx"];

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

router.use(verifyJWT, requireAdmin);

router.get("/summary", getDashboardSummary);
router.get("/students", getStudents);
router.patch(
  "/students/:id",
  [
    body("isVerifiedStudent")
      .optional()
      .isBoolean()
      .withMessage("isVerifiedStudent must be a boolean"),
    body("status")
      .optional()
      .isIn(["pending", "active", "banned", "temp_banned"])
      .withMessage("Invalid status"),
    body("resetDevices")
      .optional()
      .isBoolean()
      .withMessage("resetDevices must be a boolean")
  ],
  validateRequest,
  updateStudent
);
router.delete("/devices/:id", deleteDevice);

router.get(
  "/payments",
  [
    query("status")
      .optional()
      .isIn(["pending", "verified", "rejected"])
      .withMessage("Invalid payment status")
  ],
  validateRequest,
  getPayments
);
router.patch(
  "/payments/:id",
  [
    body("action")
      .isIn(["verify", "reject"])
      .withMessage("Invalid payment action"),
    body("notes").optional().isString()
  ],
  validateRequest,
  updatePayment
);

router.post(
  "/assignments",
  [
    body("userId").isMongoId().withMessage("Valid user is required"),
    body("courseId").isMongoId().withMessage("Valid course is required")
  ],
  validateRequest,
  assignCourse
);

router.get("/courses", getCourses);
router.post(
  "/courses",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("type").isIn(["free", "paid"]).withMessage("Course type is required"),
    body("thumbnail")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Thumbnail must be a URL"),
    body("order").optional().isInt({ min: 0 }),
    body("isPublished").optional().isBoolean()
  ],
  validateRequest,
  createCourse
);
router.put(
  "/courses/:id",
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().isString(),
    body("type").optional().isIn(["free", "paid"]),
    body("thumbnail")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Thumbnail must be a URL"),
    body("order").optional().isInt({ min: 0 }),
    body("isPublished").optional().isBoolean()
  ],
  validateRequest,
  updateCourse
);

router.post(
  "/modules",
  [
    body("courseId").isMongoId().withMessage("Valid course is required"),
    body("title").trim().notEmpty().withMessage("Module title is required"),
    body("order").optional().isInt({ min: 0 })
  ],
  validateRequest,
  createModule
);

router.post(
  "/lessons",
  [
    body("moduleId").isMongoId().withMessage("Valid module is required"),
    body("title").trim().notEmpty().withMessage("Lesson title is required"),
    body("contentType")
      .optional()
      .isIn(lessonContentTypes)
      .withMessage("Valid lesson type is required"),
    body("youtubeId")
      .trim()
      .custom((value, { req }) => {
        const contentType = req.body.contentType || "youtube";

        if (contentType !== "youtube") {
          return true;
        }

        if (!extractYouTubeId(value)) {
          throw new Error("YouTube link or ID is required");
        }

        return true;
      }),
    body("resourceUrl")
      .trim()
      .custom((value, { req }) => {
        const contentType = req.body.contentType || "youtube";

        if (contentType === "youtube") {
          return true;
        }

        if (!value || !isValidUrl(value)) {
          throw new Error("Valid resource URL is required");
        }

        if (
          contentType === "google_doc" &&
          !value.includes("docs.google.com") &&
          !value.includes("drive.google.com")
        ) {
          throw new Error("Google Docs or Drive link is required");
        }

        return true;
      }),
    body("duration").optional().isString(),
    body("order").optional({ checkFalsy: true }).isInt({ min: 0 }),
    body("isFree").optional().isBoolean()
  ],
  validateRequest,
  createLesson
);

router.get("/live-classes", getLiveClasses);
router.post(
  "/live-classes",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("meetLink")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Meet link must be a URL"),
    body("scheduledAt").isISO8601().withMessage("Scheduled time is required"),
    body("recordingUrl")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Recording URL must be a URL"),
    body("isPublished").optional().isBoolean()
  ],
  validateRequest,
  createLiveClass
);
router.patch(
  "/live-classes/:id",
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().isString(),
    body("meetLink")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Meet link must be a URL"),
    body("scheduledAt").optional().isISO8601(),
    body("recordingUrl")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Recording URL must be a URL"),
    body("isPublished").optional().isBoolean()
  ],
  validateRequest,
  updateLiveClass
);

export default router;
