// src/pages/HomeFeed.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/Card";

export default function HomeFeed() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const querySnapshot = await getDocs(collection(db, "plans"));
      const plansData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlans(plansData);
    };
    fetchPlans();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-brand-dark">
        All Plans
      </h1>

      {plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No plans available yet.</p>
      )}
    </div>
  );
}
