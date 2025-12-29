import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  photo_url: String,
  accommodation: String,
  bio: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
