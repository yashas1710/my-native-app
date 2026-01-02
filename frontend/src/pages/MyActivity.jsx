// src/pages/MyActivity.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";

export default function MyActivity() {
  const { user } = useAuth();
  const [createdPlans, setCreatedPlans] = useState([]);
  const [joinedPlans, setJoinedPlans] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchCreatedPlans = async () => {
      const q = query(collection(db, "plans"), where("creator_id", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setCreatedPlans(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchJoinedPlans = async () => {
      const q = query(collection(db, "planParticipants"), where("user_id", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const joinedData = querySnapshot.docs.map((doc) => doc.data());

      const plans = [];
      for (const p of joinedData) {
        const planRef = doc(db, "plans", p.plan_id);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          plans.push({ id: planSnap.id, ...planSnap.data() });
        }
      }
      setJoinedPlans(plans);
    };

    fetchCreatedPlans();
    fetchJoinedPlans();
  }, [user]);

  if (!user) return <p className="p-6">Please login to view your activity.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-brand-dark">My Activity</h1>

      {/* Created Plans */}
      <h2 className="text-xl font-semibold mb-4 text-brand">Created Plans</h2>
      {createdPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {createdPlans.map((plan) => (
            <Card key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">You haven’t created any plans yet.</p>
      )}

      {/* Joined Plans */}
      <h2 className="text-xl font-semibold mb-4 text-brand mt-8">Joined Plans</h2>
      {joinedPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {joinedPlans.map((plan) => (
            <Card key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You haven’t joined any plans yet.</p>
      )}
    </div>
  );
}
