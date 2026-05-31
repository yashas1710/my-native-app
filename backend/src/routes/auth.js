import express from "express";
import AuthController from "../controllers/AuthController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", (req, res) => AuthController.signup(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));

// Protected routes
router.get("/me", auth, (req, res) => AuthController.getMe(req, res));
router.patch("/profile", auth, (req, res) => AuthController.updateProfile(req, res));

export default router;

