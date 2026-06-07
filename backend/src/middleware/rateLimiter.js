import rateLimit from "express-rate-limit";

/**
 * General API rate limiter — applies to all /api/* routes.
 * 100 requests / 15 min per IP, with trust proxy already set in app.js.
 * Slow-down instead of hard fail (better UX, still deters abuse).
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

/**
 * Strict limiter for authentication endpoints (login, password reset, etc).
 * 10 attempts / 15 min per IP — deters brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes."
  }
});
