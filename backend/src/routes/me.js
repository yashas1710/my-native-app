import express from "express";
import AuthController from "../controllers/AuthController.js";
import auth from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.put("/location", auth, apiLimiter, (req, res) => AuthController.updateLocation(req, res));

export default router;
