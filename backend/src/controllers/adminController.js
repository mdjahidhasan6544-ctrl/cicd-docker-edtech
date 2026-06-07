import { Course } from "../models/Course.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { Device } from "../models/Device.js";
import { Lesson } from "../models/Lesson.js";
import { LiveClass } from "../models/LiveClass.js";
import { Module } from "../models/Module.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { extractYouTubeId } from "../utils/lessonContent.js";
import { serializePayment, summarizePaymentStatus } from "../utils/paymentStatus.js";
import { sendError, sendSuccess } from "../utils/response.js";

async function loadCourseTree() {
  const [courses, modules, lessons] = await Promise.all([
    Course.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    Module.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    Lesson.find({}).sort({ order: 1, createdAt: 1 }).lean()
  ]);

  const lessonMap = lessons.reduce((result, lesson) => {
    const moduleId = lesson.moduleId.toString();

    if (!result[moduleId]) {
      result[moduleId] = [];
    }

    result[moduleId].push({
      ...lesson,
      id: lesson._id.toString(),
      contentType: lesson.contentType || "youtube",
      youtubeId: lesson.youtubeId || "",
      resourceUrl: lesson.resourceUrl || "",
      topic: lesson.topic || "",
      learningObjectives: lesson.learningObjectives || [],
      summary: lesson.summary || "",
      exampleProblem: lesson.exampleProblem || "",
      practiceHint: lesson.practiceHint || "",
      notesUrl: lesson.notesUrl || ""
    });

    return result;
  }, {});

  const moduleMap = modules.reduce((result, moduleItem) => {
    const courseId = moduleItem.courseId.toString();

    if (!result[courseId]) {
      result[courseId] = [];
    }

    result[courseId].push({
      ...moduleItem,
      id: moduleItem._id.toString(),
      chapterCode: moduleItem.chapterCode || "",
      focusTopics: moduleItem.focusTopics || [],
      lessons: lessonMap[moduleItem._id.toString()] || []
    });

    return result;
  }, {});

  return courses.map((course) => ({
    ...course,
    id: course._id.toString(),
    modules: moduleMap[course._id.toString()] || []
  }));
}

export async function getDashboardSummary(req, res, next) {
  try {
    const [pendingStudents, pendingPayments, totalCourses, publishedLiveClasses] =
      await Promise.all([
        User.countDocuments({ role: "student", isVerifiedStudent: false }),
        Payment.countDocuments({ status: "pending" }),
        Course.countDocuments({}),
        LiveClass.countDocuments({ isPublished: true })
      ]);

    return sendSuccess(res, {
      stats: {
        pendingStudents,
        pendingPayments,
        totalCourses,
        publishedLiveClasses
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStudents(req, res, next) {
  try {
    const students = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map((student) => student._id);
    const [devices, payments] = await Promise.all([
      Device.find({ userId: { $in: studentIds } })
        .sort({ lastSeen: -1 })
        .lean(),
      Payment.find({ userId: { $in: studentIds } })
        .populate("courseId", "title")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const devicesByUserId = devices.reduce((result, device) => {
      const userId = device.userId.toString();

      if (!result.has(userId)) {
        result.set(userId, []);
      }

      result.get(userId).push({
        id: device._id.toString(),
        userAgent: device.userAgent,
        ip: device.ip,
        lastSeen: device.lastSeen
      });

      return result;
    }, new Map());

    const paymentsByUserId = payments.reduce((result, payment) => {
      const userId = payment.userId.toString();

      if (!result.has(userId)) {
        result.set(userId, []);
      }

      result.get(userId).push(payment);

      return result;
    }, new Map());

    const payload = students.map((student) => {
      const userId = student._id.toString();
      const studentDevices = devicesByUserId.get(userId) || [];
      const studentPayments = paymentsByUserId.get(userId) || [];

      return {
        id: userId,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phone: student.phone || "",
        institution: student.institution || "",
        classLevel: student.classLevel || "",
        address: student.address || "",
        status: student.status,
        approvalStatus: student.isVerifiedStudent ? "approved" : "pending",
        isVerifiedStudent: student.isVerifiedStudent,
        paymentStatus: summarizePaymentStatus(studentPayments),
        payments: studentPayments.map(serializePayment),
        deviceCount: studentDevices.length,
        devices: studentDevices
      };
    });

    return sendSuccess(res, { students: payload });
  } catch (error) {
    return next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const { isVerifiedStudent, status, resetDevices } = req.body;
    const student = await User.findOne({
      _id: req.params.id,
      role: "student"
    });

    if (!student) {
      return sendError(res, "Student not found", 404);
    }

    if (typeof isVerifiedStudent === "boolean") {
      student.isVerifiedStudent = isVerifiedStudent;
    }

    if (status) {
      student.status = status;
    }

    if (student.isVerifiedStudent && student.status === "pending") {
      student.status = "active";
    }

    if (resetDevices) {
      await Device.deleteMany({ userId: student._id });

      if (student.status === "temp_banned") {
        student.status = student.isVerifiedStudent ? "active" : "pending";
      }
    }

    await student.save();

    return sendSuccess(res, {
      message: "Student updated",
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        isVerifiedStudent: student.isVerifiedStudent,
        status: student.status
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDevice(req, res, next) {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return sendError(res, "Device not found", 404);
    }

    const student = await User.findById(device.userId);
    await device.deleteOne();

    if (student && student.status === "temp_banned") {
      student.status = student.isVerifiedStudent ? "active" : "pending";
      await student.save();
    }

    return sendSuccess(res, {
      message: "Device removed"
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const payments = await Payment.find(filters)
      .populate("userId", "name email studentId")
      .populate("courseId", "title type")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { payments });
  } catch (error) {
    return next(error);
  }
}

export async function updatePayment(req, res, next) {
  try {
    const { action, notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, "Payment not found", 404);
    }

    if (action === "verify") {
      payment.status = "verified";
      payment.verifiedBy = req.user.id;
      payment.notes = notes || "";

      await CourseAssignment.findOneAndUpdate(
        {
          userId: payment.userId,
          courseId: payment.courseId
        },
        {
          userId: payment.userId,
          courseId: payment.courseId,
          assignedAt: new Date(),
          assignedBy: req.user.id
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      const student = await User.findOne({
        _id: payment.userId,
        role: "student"
      });

      if (student && student.status === "pending") {
        student.isVerifiedStudent = true;
        student.status = "active";
        await student.save();
      }
    } else if (action === "reject") {
      payment.status = "rejected";
      payment.verifiedBy = req.user.id;
      payment.notes = notes || "";
    } else {
      return sendError(res, "Invalid payment action", 400);
    }

    await payment.save();

    return sendSuccess(res, {
      message: action === "verify" ? "Payment verified successfully" : "Payment rejected successfully",
      payment
    });
  } catch (error) {
    return next(error);
  }
}

export async function assignCourse(req, res, next) {
  try {
    const { userId, courseId } = req.body;
    const [student, course] = await Promise.all([
      User.findOne({ _id: userId, role: "student" }),
      Course.findById(courseId)
    ]);

    if (!student) {
      return sendError(res, "Student not found", 404);
    }

    if (!course) {
      return sendError(res, "Course not found", 404);
    }

    const assignment = await CourseAssignment.findOneAndUpdate(
      {
        userId,
        courseId
      },
      {
        userId,
        courseId,
        assignedAt: new Date(),
        assignedBy: req.user.id
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return sendSuccess(res, {
      message: "Course assigned",
      assignment
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourses(req, res, next) {
  try {
    const courses = await loadCourseTree();

    return sendSuccess(res, { courses });
  } catch (error) {
    return next(error);
  }
}

export async function createCourse(req, res, next) {
  try {
    const course = await Course.create(req.body);

    return sendSuccess(
      res,
      {
        message: "Course created",
        course
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return sendError(res, "Course not found", 404);
    }

    return sendSuccess(res, {
      message: "Course updated",
      course
    });
  } catch (error) {
    return next(error);
  }
}

export async function createModule(req, res, next) {
  try {
    const course = await Course.findById(req.body.courseId);

    if (!course) {
      return sendError(res, "Course not found", 404);
    }

    const moduleItem = await Module.create(req.body);

    return sendSuccess(
      res,
      {
        message: "Module created",
        module: moduleItem
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function createLesson(req, res, next) {
  try {
    const moduleItem = await Module.findById(req.body.moduleId);

    if (!moduleItem) {
      return sendError(res, "Module not found", 404);
    }

    const contentType = req.body.contentType || "youtube";
    const hasExplicitOrder =
      req.body.order !== undefined &&
      req.body.order !== null &&
      `${req.body.order}`.trim() !== "";
    let order = 0;

    if (hasExplicitOrder) {
      order = Number(req.body.order);
    } else {
      const lastLesson = await Lesson.findOne({ moduleId: moduleItem._id })
        .sort({ order: -1, createdAt: -1 })
        .lean();

      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    const lesson = await Lesson.create({
      ...req.body,
      contentType,
      order,
      youtubeId: contentType === "youtube" ? extractYouTubeId(req.body.youtubeId) : "",
      resourceUrl: contentType === "youtube" ? "" : (req.body.resourceUrl || "").trim()
    });

    return sendSuccess(
      res,
      {
        message: "Lesson created",
        lesson
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function getLiveClasses(req, res, next) {
  try {
    const liveClasses = await LiveClass.find({})
      .sort({ scheduledAt: 1 })
      .lean();

    return sendSuccess(res, { liveClasses });
  } catch (error) {
    return next(error);
  }
}

export async function createLiveClass(req, res, next) {
  try {
    const liveClass = await LiveClass.create({
      ...req.body,
      createdBy: req.user.id
    });

    return sendSuccess(
      res,
      {
        message: "Live class scheduled",
        liveClass
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateLiveClass(req, res, next) {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!liveClass) {
      return sendError(res, "Live class not found", 404);
    }

    return sendSuccess(res, {
      message: "Live class updated",
      liveClass
    });
  } catch (error) {
    return next(error);
  }
}
