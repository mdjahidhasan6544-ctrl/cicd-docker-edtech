import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { sendError, sendSuccess } from "../utils/response.js";

function sanitizeUser(user) {
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

function parseExpiryToMs(expiry) {
  if (!expiry) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const raw = `${expiry}`.trim();
  const match = raw.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: parseExpiryToMs(process.env.JWT_EXPIRY || "7d")
  };
}

function getJwtSecret() {
  return process.env.JWT_SECRET?.trim();
}

function getConfiguredAdminAccount() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
    name: process.env.ADMIN_NAME?.trim() || "Scholastica Admin"
  };
}

async function syncConfiguredAdminUser(user, adminAccount, { updatePassword = false } = {}) {
  let updated = false;

  if (user.name !== adminAccount.name) {
    user.name = adminAccount.name;
    updated = true;
  }

  if (updatePassword) {
    user.passwordHash = await bcrypt.hash(adminAccount.password, 12);
    updated = true;
  }

  if (user.role !== "admin") {
    user.role = "admin";
    updated = true;
  }

  if (!user.isVerifiedStudent) {
    user.isVerifiedStudent = true;
    updated = true;
  }

  if (user.status !== "active") {
    user.status = "active";
    updated = true;
  }

  if (updated) {
    await user.save();
  }

  return user;
}

function signToken(user) {
  const jwtSecret = getJwtSecret();

  return jwt.sign(
    {
      id: user._id.toString()
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRY || "7d"
    }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, studentId, password } = req.body;

    if (!email || !password || !name) {
      return sendError(res, "All fields are required", 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminAccount = getConfiguredAdminAccount();
    const isAdminRegistration = Boolean(adminAccount && cleanEmail === adminAccount.email);
    const cleanStudentId = isAdminRegistration ? `ADMIN-${Date.now()}` : studentId?.trim();

    if (!isAdminRegistration && !cleanStudentId) {
      return sendError(res, "All fields are required", 400);
    }

    if (isAdminRegistration && password !== adminAccount.password) {
      return sendError(res, "Invalid admin registration credentials", 403);
    }

    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { studentId: cleanStudentId }
      ]
    });

    if (existingUser) {
      if (isAdminRegistration && existingUser.email === cleanEmail) {
        const user = await syncConfiguredAdminUser(existingUser, adminAccount, {
          updatePassword: true
        });

        return sendSuccess(res, {
          message: "Admin account is ready.",
          user: sanitizeUser(user)
        });
      }

      return sendError(res, "Email or student ID already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: isAdminRegistration ? adminAccount.name : name,
      email: cleanEmail,
      studentId: cleanStudentId,
      passwordHash,
      role: isAdminRegistration ? "admin" : "student",
      isVerifiedStudent: isAdminRegistration,
      status: isAdminRegistration ? "active" : "pending"
    });

    return sendSuccess(
      res,
      {
        message: isAdminRegistration
          ? "Admin registration successful."
          : "Registration successful. Await admin verification.",
        user: sanitizeUser(user)
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function resolveLoginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Invalid email or password", 401);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    const adminAccount = getConfiguredAdminAccount();
    const isConfiguredAdmin = Boolean(adminAccount && cleanEmail === adminAccount.email);
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    const adminPasswordMatches = isConfiguredAdmin && password === adminAccount.password;

    if (!passwordMatches && !adminPasswordMatches) {
      return sendError(res, "Invalid email or password", 401);
    }

    if (isConfiguredAdmin) {
      await syncConfiguredAdminUser(user, adminAccount, {
        updatePassword: adminPasswordMatches && !passwordMatches
      });
    }

    if (user.role !== "admin") {
      if (user.status === "banned") {
        return sendError(res, "Account is blocked", 403);
      }

      if (user.status === "temp_banned") {
        return sendError(res, "Device limit reached. Contact admin.", 403, {
          code: "DEVICE_LIMIT"
        });
      }
    }

    req.loginUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = req.loginUser;

    if (!user) {
      return sendError(res, "Login context missing", 500);
    }

    const token = signToken(user);
    res.cookie("token", token, getCookieOptions());

    return sendSuccess(res, {
      message: "Login successful",
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  res.clearCookie("token", getCookieOptions());

  return sendSuccess(res, {
    message: "Logged out successfully"
  });
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, "Session is no longer valid", 401);
    }

    return sendSuccess(res, {
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}
