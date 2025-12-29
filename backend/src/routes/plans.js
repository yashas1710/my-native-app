import express from "express";
import auth from "../middleware/auth.js";
import Plan from "../models/Plan.js";
import PlanParticipant from "../models/PlanParticipant.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Create a new plan
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, datetime, location, max_spots } = req.body;
    if (!title || !datetime || !location) {
      return res.status(400).json({ msg: "Title, datetime and location are required" });
    }

    const creator = await User.findById(req.user.id);
    if (!creator) return res.status(404).json({ msg: "User not found" });

    const plan = await Plan.create({
      title,
      description,
      datetime,
      location,
      creator_id: req.user.id,
      max_spots: max_spots ?? null,
    });

    res.json({ msg: "Plan created", plan });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Feed: upcoming plans in same accommodation
router.get("/", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("accommodation");
    if (!me) return res.status(404).json({ msg: "User not found" });

    const now = new Date();
    const plans = await Plan.find({ datetime: { $gte: now } })
      .populate("creator_id", "name photo_url accommodation")
      .sort({ datetime: 1 });

    //filter by same accommodation
    const filtered = plans.filter(
      (p) => p.creator_id && p.creator_id.accommodation === me.accommodation
    );

    

    // count participants
    const planIds = filtered.map((p) => p._id);
    const counts = await PlanParticipant.aggregate([
      { $match: { plan_id: { $in: planIds } } },
      { $group: { _id: "$plan_id", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const result = filtered.map((p) => ({
      ...p.toObject(),
      participants_count: countMap.get(String(p._id)) || 0,
    }));

    res.json({ plans: result });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Plan detail with participants
router.get("/:id", auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate("creator_id", "name photo_url accommodation");
    if (!plan) return res.status(404).json({ msg: "Plan not found" });

    const participants = await PlanParticipant.find({ plan_id: plan._id })
      .populate("user_id", "name photo_url");

    res.json({ plan, participants });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Join plan
router.post("/:id/join", auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ msg: "Plan not found" });

    // already joined?
    const existing = await PlanParticipant.findOne({
      plan_id: plan._id,
      user_id: req.user.id,
    });
    if (existing) return res.status(400).json({ msg: "Already joined" });

    // max spots check
    if (plan.max_spots) {
      const count = await PlanParticipant.countDocuments({ plan_id: plan._id });
      if (count >= plan.max_spots) {
        return res.status(400).json({ msg: "Max spots reached" });
      }
    }

    await PlanParticipant.create({ plan_id: plan._id, user_id: req.user.id });
    res.json({ msg: "Joined" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ My activity: plans I created
router.get("/me/created", auth, async (req, res) => {
  const plans = await Plan.find({ creator_id: req.user.id }).sort({ datetime: -1 });
  res.json({ plans });
});

// ✅ My activity: plans I joined
router.get("/me/joined", auth, async (req, res) => {
  const joins = await PlanParticipant.find({ user_id: req.user.id }).populate("plan_id");
  res.json({ plans: joins.map((j) => j.plan_id).filter(Boolean) });
});

export default router;
