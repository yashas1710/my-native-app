import PlanService from "../services/PlanService.js";
import { validateInput, createPlanSchema, updatePlanSchema } from "../validators/planValidator.js";

export class PlanController {
  async createPlan(req, res) {
    try {
      const validation = validateInput(createPlanSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.errors });
      }

      const plan = await PlanService.createPlan(
        req.user.id,
        validation.data,
        req.user
      );

      res.status(201).json({
        message: "Plan created successfully",
        plan,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getPlanById(req, res) {
    try {
      const result = await PlanService.getPlanDetails(
        req.params.id,
        req.user.id
      );

      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async updatePlan(req, res) {
  try {
    console.log("🛠️ UPDATE BODY:", req.body);

    const validation = validateInput(
      updatePlanSchema,
      req.body
    );

    if (!validation.success) {
      console.log(
        "❌ VALIDATION FAILED:",
        validation.errors
      );

      return res.status(400).json({
        errors: validation.errors,
      });
    }

    const plan = await PlanService.updatePlan(
      req.params.id,
      req.user.id,
      validation.data
    );

    res.json({
      message: "Plan updated successfully",
      plan,
    });
  } catch (err) {
    console.error("❌ UPDATE ERROR:", err);

    if (err.message.includes("Only creator")) {
      return res.status(403).json({
        error: err.message,
      });
    }

    if (err.message.includes("not found")) {
      return res.status(404).json({
        error: err.message,
      });
    }

    res.status(500).json({
      error: err.message,
    });
  }
}

  async deletePlan(req, res) {
    try {
      await PlanService.deletePlan(req.params.id, req.user.id);

      res.json({ message: "Plan deleted successfully" });
    } catch (err) {
      res.status(err.message.includes("Only creator") ? 403 : 404).json({
        error: err.message,
      });
    }
  }

  async getPlansByAccommodation(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const plans = await PlanService.getPlansByAccommodation(
        req.user.accommodationId,
        page
      );

      res.json({
        plans,
        page,
        total: plans.length,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async joinPlan(req, res) {
    try {
      await PlanService.joinPlan(req.params.id, req.user.id);

      res.json({ message: "Joined plan successfully" });
    } catch (err) {
      if (err.message.includes("Already joined")) {
        res.status(409).json({ error: err.message });
      } else if (err.message.includes("Cannot join") || err.message.includes("Unauthorized")) {
        res.status(403).json({ error: err.message });
      } else if (err.message.includes("capacity") || err.message.includes("maximum")) {
        res.status(409).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  async leavePlan(req, res) {
    try {
      await PlanService.leavePlan(req.params.id, req.user.id);

      res.json({ message: "Left plan successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getMyCreatedPlans(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const plans = await PlanService.getUserCreatedPlans(req.user.id, page);

      res.json({
        plans,
        page,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMyJoinedPlans(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const plans = await PlanService.getUserJoinedPlans(req.user.id, page);

      res.json({
        plans,
        page,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PlanController();
