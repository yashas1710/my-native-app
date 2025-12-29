import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("PlanParticipant", participantSchema);
