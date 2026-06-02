import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const DEMO_TOKEN = "demo-token";

let demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  accommodationId: "demo",
  photoUrl: "",
  bio: "",
  createdAt: new Date().toISOString(),
};

app.use(cors());
app.use(express.json());

const requireDemoAuth = (req, res, next) => {
  if (req.headers.authorization !== `Bearer ${DEMO_TOKEN}`) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  next();
};

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/auth/signup", (req, res) => {
  const { name, email, accommodationId } = req.body;

  demoUser = {
    ...demoUser,
    name,
    email,
    accommodationId,
  };

  res.json({
    success: true,
    message: "Signup endpoint working",
    token: DEMO_TOKEN,
    user: demoUser,
  });
});

app.post("/auth/login", (req, res) => {
  demoUser = {
    ...demoUser,
    email: req.body.email || demoUser.email,
  };

  res.json({
    success: true,
    token: DEMO_TOKEN,
    user: demoUser,
  });
});

app.get("/auth/me", requireDemoAuth, (req, res) => {
  res.json({ user: demoUser });
});

app.patch("/auth/profile", requireDemoAuth, (req, res) => {
  const { name, photoUrl, bio } = req.body;

  demoUser = {
    ...demoUser,
    ...(name !== undefined ? { name } : {}),
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    ...(bio !== undefined ? { bio } : {}),
  };

  res.json({
    message: "Profile updated successfully",
    user: demoUser,
  });
});

app.get("/plans", requireDemoAuth, (req, res) => {
  res.json({ plans: [], page: 1, total: 0 });
});

app.post("/plans", requireDemoAuth, (req, res) => {
  const newPlan = {
    id: `plan-${Date.now()}`,
    ...req.body,
    creatorId: demoUser.id,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(newPlan);
});

app.get("/plans/me/created", requireDemoAuth, (req, res) => {
  res.json({ plans: [], page: 1 });
});

app.get("/plans/me/joined", requireDemoAuth, (req, res) => {
  res.json({ plans: [], page: 1 });
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
