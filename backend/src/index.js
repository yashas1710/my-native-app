import express from "express";
import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import planRoutes from "./routes/plans.js";
import "./config/firebase.js"; // Initialize Firebase Admin SDK

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// Auth rate limiter — applied to unauthenticated endpoints only
import { authLimiter } from "./middleware/rateLimiters.js";
app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);

// Routes (apiLimiter is applied per-route inside each router, after auth middleware)
app.use("/auth", authRoutes);
app.use("/plans", chatRoutes);
app.use("/plans", planRoutes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
