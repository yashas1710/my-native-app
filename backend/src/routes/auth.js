import express from "express";
import AuthController from "../controllers/AuthController.js";
import auth from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Public routes — no apiLimiter (authLimiter applied in index.js)
router.post("/signup", (req, res) => AuthController.signup(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));

// Protected routes — apiLimiter runs AFTER auth, so req.user.id is available
router.get("/me", auth, apiLimiter, (req, res) => AuthController.getMe(req, res));
router.patch("/profile", auth, apiLimiter, (req, res) => AuthController.updateProfile(req, res));

export default router;
