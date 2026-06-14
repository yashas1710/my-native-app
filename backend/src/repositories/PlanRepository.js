import { db } from "../config/firebase.js";
import { plansCollection } from "../models/Plan.js";
import { participantsCollection } from "../models/PlanParticipant.js";

export class PlanRepository {
  async findById(id) {
    const doc = await plansCollection.doc(id).get();

    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() };
  }

  async findByAccommodation(accommodationId, options = {}) {
    const { limit = 20, skip = 0, onlyActive = true } = options;

    // Simple query to avoid Firestore composite index errors
    const snapshot = await plansCollection
      .where("accommodationId", "==", accommodationId)
      .get();

    let plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter active plans in backend
    if (onlyActive) {
  plans = plans.filter((p) => {
    if (!p.startDate) return false;

    let startDate;

    if (typeof p.startDate?.toDate === "function") {
      startDate = p.startDate.toDate();
    } else {
      startDate = new Date(p.startDate);
    }

    return startDate >= new Date();
  });
}

    // Sort by soonest first
    plans.sort((a, b) => {
  const dateA =
    typeof a.startDate?.toDate === "function"
      ? a.startDate.toDate()
      : new Date(a.startDate);

  const dateB =
    typeof b.startDate?.toDate === "function"
      ? b.startDate.toDate()
      : new Date(b.startDate);

  return dateA - dateB;
});

    // Pagination
    return plans.slice(skip, skip + limit);
  }

  async findByCreator(userId) {
    // Removed orderBy to avoid Firestore index requirement
    const snapshot = await plansCollection
      .where("createdBy", "==", userId)
      .get();

    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort newest first
    plans.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    return plans;
  }

  async create(planData) {
    const docRef = await plansCollection.add({
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.findById(docRef.id);
  }

  async updateById(id, updateData) {
    await plansCollection.doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return this.findById(id);
  }

  async deleteById(id) {
    const batch = db.batch();

    batch.delete(plansCollection.doc(id));

    const participantsSnapshot = await participantsCollection
      .where("planId", "==", id)
      .get();

    participantsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return true;
  }

  async getParticipantCount(planId) {
    const snapshot = await participantsCollection
      .where("planId", "==", planId)
      .get();

    return snapshot.size;
  }

  async joinPlan(
  planId,
  userId,
  userEmail,
  userName,
  userPhotoUrl
) {
  try {
    const result = await db.runTransaction(
      async (t) => {
        const planRef =
          plansCollection.doc(planId);

        const planDoc =
          await t.get(planRef);

        if (!planDoc.exists) {
          throw new Error(
            "Plan not found"
          );
        }

        const plan = planDoc.data();

        const existingParticipants =
          await participantsCollection
            .where(
              "planId",
              "==",
              planId
            )
            .where(
              "userId",
              "==",
              userId
            )
            .limit(1)
            .get();

        if (
          !existingParticipants.empty
        ) {
          throw new Error(
            "Already joined this plan"
          );
        }

        if (plan.maxSpots) {
          const participantCount =
            await participantsCollection
              .where(
                "planId",
                "==",
                planId
              )
              .get();

          if (
            participantCount.size >=
            plan.maxSpots
          ) {
            throw new Error(
              "Plan is at maximum capacity"
            );
          }
        }

        const participantRef =
          participantsCollection.doc();

        t.set(participantRef, {
          planId,
          userId,
          userEmail,
          userName,

          userPhotoUrl:
            userPhotoUrl || "",

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          id: participantRef.id,
        };
      }
    );

    return result;
  } catch (err) {
    throw err;
  }
}

  async leavePlan(planId, userId) {
  const snapshot =
    await participantsCollection
      .where("planId", "==", planId)
      .where("userId", "==", userId)
      .get();

  if (snapshot.empty) {
    throw new Error(
      "Participant not found"
    );
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return true;
}

  async getPlanParticipants(planId) {
    const snapshot = await participantsCollection
      .where("planId", "==", planId)
      .get();

    const participants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort oldest join first
    participants.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return participants;
  }

  async isParticipant(planId, userId) {
    const snapshot = await participantsCollection
      .where("planId", "==", planId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  async getUserJoinedPlans(userId, options = {}) {
    const { limit = 20, skip = 0 } = options;

    const participantsSnapshot = await participantsCollection
      .where("userId", "==", userId)
      .get();

    if (participantsSnapshot.empty) return [];

    const participantDocs = participantsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);

    if (participantDocs.length === 0) return [];

    // Single batched read instead of N sequential reads
    const planRefs = participantDocs.map((p) =>
      plansCollection.doc(p.planId)
    );
    const planDocs = await db.getAll(...planRefs);

    return planDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export default new PlanRepository();