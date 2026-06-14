import rateLimit from "express-rate-limit";

// 10 requests per minute per IP — for unauthenticated auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip,
});

// 100 requests per 15 minutes per authenticated user (req.user.id set by auth middleware)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip,
});
