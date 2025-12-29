import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import auth from "./src/middleware/auth.js";
import planRoutes from "./src/routes/plans.js";



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())
app.use("/auth", authRoutes);;
app.use("/plans", planRoutes);

app.get("/", (req, res) => res.send("UnPlanGo API running"));
app.get("/me", auth, (req, res) => res.json({ msg: "OK", userId: req.user.id }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err.message));

  const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


