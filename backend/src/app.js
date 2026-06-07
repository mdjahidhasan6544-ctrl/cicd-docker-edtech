import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/student.js";
import { ensureAdminAccount } from "./utils/ensureAdminAccount.js";

dotenv.config();

const DEFAULT_CLIENT_URLS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function validateEnv() {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return `${value}`.trim().replace(/\/+$/, "");
  }
}

function isAllowedDevOrigin(origin) {
  if (process.env.NODE_ENV === "production" || !origin) {
    return false;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

const allowedOrigins = `${process.env.CLIENT_URL || DEFAULT_CLIENT_URLS.join(",")}`
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin)) || isAllowedDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
};

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Scholastica Stars 3.0 backend is running",
    healthCheck: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy"
  });
});

// Apply general API rate limiting to all /api/* routes (after health check
// so liveness probes are never throttled).
app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

let startupPromise;

export async function initializeApp() {
  if (!startupPromise) {
    startupPromise = (async () => {
      validateEnv();
      await connectDB();
      await ensureAdminAccount();
    })().catch((error) => {
      startupPromise = null;
      throw error;
    });
  }

  return startupPromise;
}

export default app;
