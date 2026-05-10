import PlanRepository from "../repositories/PlanRepository.js";
import UserRepository from "../repositories/UserRepository.js";

export class PlanService {
  async createPlan(userId, planData) {
    const userDoc = await UserRepository.findById(userId);

    if (!userDoc) {
      throw new Error("User not found");
    }

    // IMPORTANT:
    // accommodationId is automatically taken from logged-in user
    // frontend should NOT send its own accommodationId
    const plan = await PlanRepository.create({
      ...planData,
      createdBy: userId,
      accommodationId: userDoc.accommodationId,
      creatorName: userDoc.name,
      creatorPhotoUrl: userDoc.photoUrl || "",
    });

    return this.toPlanDTO(plan);
  }

  async updatePlan(planId, userId, updateData) {
    const plan = await PlanRepository.findById(planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.createdBy !== userId) {
      throw new Error("Only creator can update this plan");
    }

    const updated = await PlanRepository.updateById(
      planId,
      updateData
    );

    return this.toPlanDTO(updated);
  }

  async deletePlan(planId, userId) {
    const plan = await PlanRepository.findById(planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.createdBy !== userId) {
      throw new Error("Only creator can delete this plan");
    }

    await PlanRepository.deleteById(planId);
  }

  async getPlansByAccommodation(accommodationId, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const plans = await PlanRepository.findByAccommodation(
      accommodationId,
      {
        limit,
        skip,
        onlyActive: true,
      }
    );

    return plans.map((p) => this.toPlanDTO(p));
  }

  async joinPlan(planId, userId) {
    const plan = await PlanRepository.findById(planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (plan.accommodationId !== user.accommodationId) {
      throw new Error(
        "Cannot join plan from another accommodation"
      );
    }

    await PlanRepository.joinPlan(
      planId,
      userId,
      user.email,
      user.name,
      user.photoUrl || ""
    );

    return {
      success: true,
      message: "Joined plan successfully",
    };
  }

  async leavePlan(planId, userId) {
    const isParticipant = await PlanRepository.isParticipant(
      planId,
      userId
    );

    if (!isParticipant) {
      throw new Error("Not a participant in this plan");
    }

    await PlanRepository.leavePlan(planId, userId);

    return {
      success: true,
      message: "Left plan successfully",
    };
  }

  async getPlanDetails(planId, userId) {
    const plan = await PlanRepository.findById(planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (plan.accommodationId !== user.accommodationId) {
      throw new Error(
        "Unauthorized: Cannot view plan from another accommodation"
      );
    }

    const participants =
      await PlanRepository.getPlanParticipants(planId);

    const isParticipant =
      await PlanRepository.isParticipant(planId, userId);

    return {
      plan: this.toPlanDTO(plan),
      participants,
      isParticipant,
      participantCount: participants.length,
    };
  }

  async getUserJoinedPlans(userId, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const plans = await PlanRepository.getUserJoinedPlans(
      userId,
      {
        limit,
        skip,
      }
    );

    return plans.map((p) => this.toPlanDTO(p));
  }

  async getUserCreatedPlans(userId, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const plans = await PlanRepository.findByCreator(userId);

    return plans
      .slice(skip, skip + limit)
      .map((p) => this.toPlanDTO(p));
  }

  toPlanDTO(plan) {
  const normalizeDate = (value) => {
    if (!value) return null;

    if (typeof value?.toDate === "function") {
      return value.toDate().toISOString();
    }

    return value;
  };

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    location: plan.location,

    startDate: normalizeDate(plan.startDate),
    endDate: normalizeDate(plan.endDate),
    createdAt: normalizeDate(plan.createdAt),

    maxSpots: plan.maxSpots,

    createdBy: plan.createdBy,
    creatorName: plan.creatorName,
    creatorPhotoUrl: plan.creatorPhotoUrl,

    accommodationId: plan.accommodationId,
  };
}
}

export default new PlanService();