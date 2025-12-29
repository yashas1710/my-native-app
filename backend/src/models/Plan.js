import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  title: String,
  description: String,
  datetime: Date,
  location: String,
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  max_spots: Number,
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);
