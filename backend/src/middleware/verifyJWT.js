import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { sendError } from "../utils/response.js";

export async function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return sendError(res, "Authentication required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET?.trim());
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return sendError(res, "Session is no longer valid", 401);
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role,
      status: user.status,
      isVerifiedStudent: user.isVerifiedStudent
    };

    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired session", 401);
  }
}
