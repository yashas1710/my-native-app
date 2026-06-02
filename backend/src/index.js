import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/auth/signup", (req, res) => {
  console.log(req.body);

  res.json({
    success: true,
    message: "Signup endpoint working",
    user: req.body,
  });
});

app.post("/auth/login", (req, res) => {
  res.json({
    success: true,
    token: "demo-token",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});