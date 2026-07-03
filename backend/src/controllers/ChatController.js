import ChatRepository from "../repositories/ChatRepository.js";
import PlanRepository from "../repositories/PlanRepository.js";

export class ChatController {
  async ensureCanAccessChat(planId, userId) {
    const plan = await PlanRepository.findById(planId);

    if (!plan) {
      const err = new Error("Plan not found");
      err.status = 404;
      throw err;
    }

    const isCreator =
      plan.createdBy === userId ||
      plan.creatorId === userId ||
      plan.creator_id === userId;

    if (isCreator) {
      return plan;
    }

    const isParticipant = await PlanRepository.isParticipant(planId, userId);

    if (!isParticipant) {
      const err = new Error("Only the plan creator or participants can access chat");
      err.status = 403;
      throw err;
    }

    return plan;
  }

  async getMessages(req, res) {
    try {
      const { planId } = req.params;

      await this.ensureCanAccessChat(planId, req.user.id);

      const messages = await ChatRepository.getMessages(planId);

      res.json({ messages });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  }

  async createMessage(req, res) {
    try {
      const { planId } = req.params;
      const text = String(req.body?.text || "").trim();

      if (!text) {
        return res.status(400).json({ error: "Message text is required" });
      }

      if (text.length > 1000) {
        return res.status(400).json({ error: "Message text must be under 1000 characters" });
      }

      await this.ensureCanAccessChat(planId, req.user.id);

      const message = await ChatRepository.createMessage(planId, {
        text,
        user: req.user,
      });

      res.status(201).json({ message });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  }
}

export default new ChatController();
