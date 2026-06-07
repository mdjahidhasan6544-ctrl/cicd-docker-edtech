import { Device } from "../models/Device.js";
import { hashFingerprint } from "../utils/fingerprint.js";
import { sendError } from "../utils/response.js";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || "";
}

export async function deviceGuard(req, res, next) {
  try {
    const user = req.loginUser;

    if (!user) {
      return sendError(res, "Login context missing", 500);
    }

    if (user.role === "admin") {
      return next();
    }

    if (user.status === "banned") {
      return sendError(res, "Account is blocked", 403);
    }

    if (user.status === "temp_banned") {
      return sendError(res, "Device limit reached. Contact admin.", 403, {
        code: "DEVICE_LIMIT"
      });
    }

    const deviceFingerprint = hashFingerprint(req.body.deviceFingerprint);

    if (!deviceFingerprint) {
      return sendError(res, "Device fingerprint is required", 400);
    }

    const ip = getClientIp(req);
    const userAgent = req.get("user-agent") || "";
    const existingDevice = await Device.findOne({
      userId: user._id,
      deviceFingerprint
    });

    if (existingDevice) {
      existingDevice.lastSeen = new Date();
      existingDevice.ip = ip;
      existingDevice.userAgent = userAgent;
      await existingDevice.save();
      req.device = existingDevice;
      return next();
    }

    const deviceCount = await Device.countDocuments({ userId: user._id });

    if (deviceCount >= 3) {
      user.status = "temp_banned";
      await user.save();

      return sendError(res, "Device limit reached. Contact admin.", 403, {
        code: "DEVICE_LIMIT"
      });
    }

    req.device = await Device.create({
      userId: user._id,
      deviceFingerprint,
      userAgent,
      ip,
      lastSeen: new Date()
    });

    if (user.status === "pending" && user.isVerifiedStudent) {
      user.status = "active";
      await user.save();
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
