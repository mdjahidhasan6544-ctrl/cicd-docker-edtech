import { sendError } from "../utils/response.js";

export function requireVerified(req, res, next) {
  if (!req.user) {
    return sendError(res, "Authentication required", 401);
  }

  if (req.user.status === "banned") {
    return sendError(res, "Account is blocked", 403);
  }

  if (req.user.status === "temp_banned") {
    return sendError(res, "Device limit reached. Contact admin.", 403, {
      code: "DEVICE_LIMIT"
    });
  }

  if (!req.user.isVerifiedStudent) {
    return sendError(res, "Account pending admin verification", 403);
  }

  if (req.user.status !== "active") {
    return sendError(res, "Account is not active", 403);
  }

  return next();
}
