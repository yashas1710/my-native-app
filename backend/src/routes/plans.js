import express from "express";
import PlanController from "../controllers/PlanController.js";
import auth from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// CRITICAL: /me routes MUST come BEFORE /:id to prevent route shadowing

// Get my created plans (must be BEFORE /:id)
router.get(
  "/me/created",
  auth,
  apiLimiter,
  (req, res) => PlanController.getMyCreatedPlans(req, res)
);

// Get my joined plans (must be BEFORE /:id)
router.get(
  "/me/joined",
  auth,
  apiLimiter,
  (req, res) => PlanController.getMyJoinedPlans(req, res)
);

// Get plans for my accommodation (feed)
router.get("/", auth, apiLimiter, (req, res) =>
  PlanController.getPlansByAccommodation(req, res)
);

// Create plan
router.post("/", auth, apiLimiter, (req, res) => PlanController.createPlan(req, res));

// Get plan details (after /me routes)
router.get("/:id", auth, apiLimiter, (req, res) => PlanController.getPlanById(req, res));

// Update plan
router.put("/:id", auth, apiLimiter, (req, res) => PlanController.updatePlan(req, res));

// Delete plan
router.delete("/:id", auth, apiLimiter, (req, res) =>
  PlanController.deletePlan(req, res)
);

// Join plan
router.post("/:id/join", auth, apiLimiter, (req, res) =>
  PlanController.joinPlan(req, res)
);

// Leave plan
router.post("/:id/leave", auth, apiLimiter, (req, res) =>
  PlanController.leavePlan(req, res)
);

export default router;
