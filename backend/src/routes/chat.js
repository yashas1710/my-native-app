import express from "express";
import ChatController from "../controllers/ChatController.js";
import auth from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/:planId/messages", auth, apiLimiter, (req, res) =>
  ChatController.getMessages(req, res)
);

router.post("/:planId/messages", auth, apiLimiter, (req, res) =>
  ChatController.createMessage(req, res)
);

export default router;
