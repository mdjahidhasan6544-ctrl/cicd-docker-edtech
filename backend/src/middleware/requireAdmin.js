import { sendError } from "../utils/response.js";

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return sendError(res, "Authentication required", 401);
  }

  if (req.user.role !== "admin") {
    return sendError(res, "Admin access required", 403);
  }

  return next();
}
