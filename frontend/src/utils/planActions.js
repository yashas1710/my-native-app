// src/utils/planActions.js
import { addDoc, collection, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export const joinPlan = async (planId, user) => {
  if (!user) return toast.error("Login required");

  try {
    const q = query(collection(db, "planParticipants"), where("plan_id", "==", planId), where("user_id", "==", user.uid));
    const existing = await getDocs(q);

    if (!existing.empty) return toast.error("Already joined");

    await addDoc(collection(db, "planParticipants"), {
      plan_id: planId,
      user_id: user.uid,
      email: user.email,
      joined_at: new Date(),
    });

    toast.success("You joined the plan ✅");
  } catch (err) {
    console.error("Join plan error:", err);
    toast.error("Error joining plan ❌");
  }
};
