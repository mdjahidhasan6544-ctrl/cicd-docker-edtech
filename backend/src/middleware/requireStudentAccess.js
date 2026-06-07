import { sendError } from "../utils/response.js";

export function requireStudentAccess(req, res, next) {
  if (!req.user) {
    return sendError(res, "Authentication required", 401);
  }

  if (req.user.role !== "student") {
    return sendError(res, "Student access only", 403);
  }

  if (req.user.status === "banned") {
    return sendError(res, "Account is blocked", 403);
  }

  if (req.user.status === "temp_banned") {
    return sendError(res, "Device limit reached. Contact admin.", 403, {
      code: "DEVICE_LIMIT"
    });
  }

  return next();
}
