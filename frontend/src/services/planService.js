// planService.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // apna firebase config import karo

// ✅ Active / Upcoming Plans
export const getActivePlans = async () => {
  const today = new Date();
  const q = query(
    collection(db, "plans"),
    where("endDate", ">=", today)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Created Plans (by current user)
export const getCreatedPlans = async (userId) => {
  const q = query(
    collection(db, "plans"),
    where("createdBy", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Past Plans (History)
export const getPastPlans = async () => {
  const today = new Date();
  const q = query(
    collection(db, "plans"),
    where("endDate", "<", today)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
