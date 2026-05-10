import express from "express";
import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import planRoutes from "./src/routes/plans.js";
import corsMiddleware from "./src/middleware/cors.js";
import "./src/config/firebase.js"; // Initialize Firebase Admin SDK

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// Routes
app.use("/auth", authRoutes);
app.use("/plans", planRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



