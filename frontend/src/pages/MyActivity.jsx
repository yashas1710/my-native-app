import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import toast from "react-hot-toast";

export default function MyActivity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [createdPlans, setCreatedPlans] = useState([]);
  const [joinedPlans, setJoinedPlans] = useState([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCreatedPlans = async () => {
      const q = query(
        collection(db, "plans"),
        where("createdBy", "==", user.uid)
      );
      const snap = await getDocs(q);

      return Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
          };
        })
      );
    };

    const fetchJoinedPlans = async () => {
      const q = query(
        collection(db, "planParticipants"),
        where("user_id", "==", user.uid)
      );
      const snap = await getDocs(q);

      const plans = [];
      const joinedIds = [];

      for (const d of snap.docs) {
        const p = d.data();
        const planId = String(p.plan_id);

        const planSnap = await getDoc(doc(db, "plans", planId));
        if (!planSnap.exists()) continue;

        joinedIds.push(planId);

        const planData = planSnap.data();

        // creator info
        let creatorName = "Anonymous";
        let creatorPhotoURL = "";

        if (planData.createdBy) {
          const u = await getDoc(doc(db, "users", planData.createdBy));
          if (u.exists()) {
            creatorName = u.data().displayName || "Anonymous";
            creatorPhotoURL = u.data().photoURL || "";
          }
        }

        plans.push({
          id: planSnap.id,
          ...planData,
          creatorName,
          creatorPhotoURL,
        });
      }

      setJoinedPlanIds(joinedIds);
      return plans;
    };

    (async () => {
      try {
        const created = await fetchCreatedPlans();
        const joined = await fetchJoinedPlans();

        setCreatedPlans(created);
        setJoinedPlans(joined);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your activity");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDelete = async (planId) => {
    try {
      await deleteDoc(doc(db, "plans", planId));
      setCreatedPlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );
      toast.success("Plan deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  const handleLeave = async (planId) => {
    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", planId),
        where("user_id", "==", user.uid)
      );
      const snap = await getDocs(q);

      await Promise.all(
        snap.docs.map((d) =>
          deleteDoc(doc(db, "planParticipants", d.id))
        )
      );

      setJoinedPlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );
      setJoinedPlanIds((prev) =>
        prev.filter((id) => id !== planId)
      );

      toast.success("Left plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave plan");
    }
  };

  if (!user)
    return <p className="p-6">Please log in to view your activity.</p>;

  if (loading)
    return <p className="p-6">Loading your activity...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-brand-dark">
        My Activity
      </h1>

      {/* Created Plans */}
      <h2 className="text-xl font-semibold mb-4 text-brand">
        Created Plans
      </h2>

      {createdPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {createdPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator
              hasJoined={joinedPlanIds.includes(plan.id)}
              onEdit={() => navigate(`/edit-plan/${plan.id}`)}
              onDelete={() => handleDelete(plan.id)}
              onChat={(id) => navigate(`/chat/${id}`)} // ✅ WORKS
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">
          You haven’t created any plans yet.
        </p>
      )}

      {/* Joined Plans */}
      <h2 className="text-xl font-semibold mb-4 text-brand mt-8">
        Joined Plans
      </h2>

      {joinedPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {joinedPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              hasJoined
              onLeave={() => handleLeave(plan.id)}
              onChat={(id) => navigate(`/chat/${id}`)} // ✅ WORKS
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          You haven’t joined any plans yet.
        </p>
      )}
    </div>
  );
}
