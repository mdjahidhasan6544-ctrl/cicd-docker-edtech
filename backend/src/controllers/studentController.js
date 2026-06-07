import bcrypt from "bcryptjs";


import { Course } from "../models/Course.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { Lesson } from "../models/Lesson.js";
import { LiveClass } from "../models/LiveClass.js";
import { Module } from "../models/Module.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { serializePayment, summarizePaymentStatus } from "../utils/paymentStatus.js";
import { sendError, sendSuccess } from "../utils/response.js";

function sanitizeProfile(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    phone: user.phone || "",
    institution: user.institution || "",
    classLevel: user.classLevel || "",
    address: user.address || "",
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    status: user.status
  };
}

function isApprovedStudent(user) {
  return Boolean(user?.isVerifiedStudent) && user?.status === "active";
}

async function getAssignedCourseIds(userId) {
  const assignments = await CourseAssignment.find({ userId }).select("courseId").lean();
  return new Set(assignments.map((assignment) => assignment.courseId.toString()));
}

function isCourseAccessible(course, assignedCourseIds, user) {
  if (!isApprovedStudent(user)) {
    return false;
  }

  return course.type === "free" || assignedCourseIds.has(course._id.toString());
}

export async function getCourses(req, res, next) {
  try {
    const [courses, assignedCourseIds] = await Promise.all([
      Course.find({ isPublished: true }).sort({ order: 1, createdAt: 1 }).lean(),
      getAssignedCourseIds(req.user.id)
    ]);

    const payload = courses.map((course) => {
      const accessible = isCourseAccessible(course, assignedCourseIds, req.user);

      return {
        ...course,
        id: course._id.toString(),
        isAssigned: assignedCourseIds.has(course._id.toString()),
        isAccessible: accessible,
        isLocked: !accessible,
        level: course.level,
        subject: course.subject,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours
      };
    });

    return sendSuccess(res, { courses: payload });
  } catch (error) {
    return next(error);
  }
}

export async function getCourseDetail(req, res, next) {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true
    }).lean();

    if (!course) {
      return sendError(res, "Course not found", 404);
    }

    const [modules, lessons, assignedCourseIds] = await Promise.all([
      Module.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 }).lean(),
      Lesson.find({}).sort({ order: 1, createdAt: 1 }).lean(),
      getAssignedCourseIds(req.user.id)
    ]);

    const accessible = isCourseAccessible(course, assignedCourseIds, req.user);
    const moduleIds = new Set(modules.map((moduleItem) => moduleItem._id.toString()));
    const groupedLessons = lessons.reduce((result, lesson) => {
      const moduleId = lesson.moduleId.toString();

      if (!moduleIds.has(moduleId)) {
        return result;
      }

      if (!result[moduleId]) {
        result[moduleId] = [];
      }

      result[moduleId].push({
        id: lesson._id.toString(),
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        isFree: lesson.isFree,
        isLocked: !(lesson.isFree || accessible),
        contentType: lesson.contentType || "youtube",
        topic: lesson.topic || "",
        learningObjectives: lesson.learningObjectives || [],
        summary: lesson.summary || "",
        exampleProblem: lesson.exampleProblem || "",
        practiceHint: lesson.practiceHint || "",
        notesUrl: lesson.notesUrl || "",
        youtubeId:
          lesson.isFree || accessible
            ? lesson.contentType === "youtube" || !lesson.contentType
              ? lesson.youtubeId
              : undefined
            : undefined,
        resourceUrl:
          lesson.isFree || accessible
            ? lesson.contentType && lesson.contentType !== "youtube"
              ? lesson.resourceUrl
              : undefined
            : undefined
      });

      return result;
    }, {});

    return sendSuccess(res, {
      course: {
        ...course,
        id: course._id.toString(),
        isAssigned: assignedCourseIds.has(course._id.toString()),
        isAccessible: accessible,
        modules: modules.map((moduleItem) => ({
          ...moduleItem,
          id: moduleItem._id.toString(),
          chapterCode: moduleItem.chapterCode || "",
          focusTopics: moduleItem.focusTopics || [],
          lessons: groupedLessons[moduleItem._id.toString()] || []
        }))
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();

    if (!lesson) {
      return sendError(res, "Lesson not found", 404);
    }

    const moduleItem = await Module.findById(lesson.moduleId).lean();

    if (!moduleItem) {
      return sendError(res, "Module not found", 404);
    }

    const course = await Course.findOne({
      _id: moduleItem.courseId,
      isPublished: true
    }).lean();

    if (!course) {
      return sendError(res, "Course not found", 404);
    }

    const assignedCourseIds = await getAssignedCourseIds(req.user.id);
    const accessible = lesson.isFree || isCourseAccessible(course, assignedCourseIds, req.user);

    if (!accessible) {
      return sendError(res, "You do not have access to this lesson", 403);
    }

    return sendSuccess(res, {
      lesson: {
        id: lesson._id.toString(),
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        isFree: lesson.isFree,
        contentType: lesson.contentType || "youtube",
        topic: lesson.topic || "",
        learningObjectives: lesson.learningObjectives || [],
        summary: lesson.summary || "",
        exampleProblem: lesson.exampleProblem || "",
        practiceHint: lesson.practiceHint || "",
        notesUrl: lesson.notesUrl || "",
        youtubeId: lesson.contentType === "youtube" || !lesson.contentType ? lesson.youtubeId : "",
        resourceUrl: lesson.contentType && lesson.contentType !== "youtube" ? lesson.resourceUrl : "",
        moduleId: moduleItem._id.toString(),
        moduleTitle: moduleItem.title,
        courseId: course._id.toString(),
        courseTitle: course.title,
        subject: course.subject || "",
        level: course.level || ""
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLiveClasses(req, res, next) {
  try {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    const fifteenMinutes = 15 * 60 * 1000;
    const liveClasses = await LiveClass.find({ isPublished: true })
      .sort({ scheduledAt: 1 })
      .lean();

    const payload = liveClasses.map((liveClass) => {
      const scheduledAt = new Date(liveClass.scheduledAt).getTime();
      const canJoin = now >= scheduledAt - fifteenMinutes && now <= scheduledAt + twoHours;

      return {
        ...liveClass,
        id: liveClass._id.toString(),
        canJoin,
        meetLink: canJoin ? liveClass.meetLink : "",
        isUpcoming: scheduledAt >= now,
        isCompleted: scheduledAt + twoHours < now
      };
    });

    return sendSuccess(res, {
      liveClasses: payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const [user, payments] = await Promise.all([
      User.findById(req.user.id).lean(),
      Payment.find({ userId: req.user.id })
        .populate("courseId", "title")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      profile: {
        ...sanitizeProfile(user),
        approvalStatus: user.isVerifiedStudent ? "approved" : "pending",
        paymentStatus: summarizePaymentStatus(payments),
        payments: payments.map(serializePayment)
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, phone, institution, classLevel, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      email: normalizedEmail
    }).lean();

    if (existingUser) {
      return sendError(res, "Email is already in use", 409);
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = (phone || "").trim();
    user.institution = (institution || "").trim();
    user.classLevel = (classLevel || "").trim();
    user.address = (address || "").trim();

    await user.save();

    return sendSuccess(res, {
      message: "Profile updated successfully",
      profile: sanitizeProfile(user)
    });
  } catch (error) {
    return next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!matches) {
      return sendError(res, "Current password is incorrect", 400);
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);

    if (sameAsCurrent) {
      return sendError(res, "New password must be different from the current password", 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return sendSuccess(res, {
      message: "Password changed successfully"
    });
  } catch (error) {
    return next(error);
  }
}

export async function submitPayment(req, res, next) {
  try {
    const { courseId, method, transactionId, phoneNumber, amount } = req.body;
    const course = await Course.findById(courseId).lean();

    if (!course || !course.isPublished) {
      return sendError(res, "Course not found", 404);
    }

    if (course.type !== "paid") {
      return sendError(res, "Payments are only accepted for paid courses", 400);
    }

    const existingAssignment = await CourseAssignment.findOne({
      userId: req.user.id,
      courseId
    }).lean();

    if (existingAssignment) {
      return sendError(res, "Course already assigned to this account", 400);
    }

    let payment = await Payment.findOne({
      userId: req.user.id,
      courseId
    });

    if (!payment) {
      payment = await Payment.create({
        userId: req.user.id,
        courseId,
        method,
        transactionId,
        phoneNumber: phoneNumber.trim(),
        amount,
        status: "pending"
      });
    } else if (payment.status === "verified") {
      return sendError(res, "Payment already verified for this course", 400);
    } else {
      payment.method = method;
      payment.transactionId = transactionId;
      payment.phoneNumber = phoneNumber.trim();
      payment.amount = amount;
      payment.status = "pending";
      payment.verifiedBy = null;
      payment.notes = "";
      await payment.save();
    }

    return sendSuccess(
      res,
      {
        message: "Payment submitted for review",
        payment
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}
