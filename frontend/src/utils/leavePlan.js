import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";

export const leavePlan = async (planId, user) => {
  if (!user) return toast.error("Login required");

  try {
    const q = query(
      collection(db, "planParticipants"),
      where("planId", "==", planId),
      where("userId", "==", user.id)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return toast.error("You are not part of this plan");

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "planParticipants", docSnap.id));
    }

    toast.success("You left the plan ✅");
  } catch (err) {
    console.error("Leave plan error:", err);
    toast.error("Error leaving plan ❌");
  }
};
