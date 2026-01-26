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
import Spinner from "../components/Spinner";

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
      const q = query(collection(db, "plans"), where("createdBy", "==", user.uid));
      const snap = await getDocs(q);
      const plans = [];

      for (const d of snap.docs) {
        const planData = d.data();
        let creatorName = "Unknown";
        let creatorPhoto = "";
        try {
          const uSnap = await getDoc(doc(db, "users", planData.createdBy));
          if (uSnap.exists()) {
            const u = uSnap.data();
            creatorName = u.displayName || u.fullName || u.email || "Unknown";
            creatorPhoto = u.photoURL || "";
          }
        } catch (e) {
          console.warn("Error fetching creator:", e);
        }

        plans.push({
          id: d.id,
          ...planData,
          creatorName,
          creatorPhoto,
        });
      }

      return plans;
    };

    const fetchJoinedPlans = async () => {
      const q = query(collection(db, "planParticipants"), where("user_id", "==", user.uid));
      const snap = await getDocs(q);

      const plans = [];
      const joinedIds = [];

      for (const d of snap.docs) {
        const p = d.data();
        let planSnap;
        try {
          planSnap = await getDoc(doc(db, "plans", String(p.plan_id)));
          if (!planSnap.exists()) continue;
          joinedIds.push(String(p.plan_id));
        } catch (e) {
          console.error("Error resolving plan:", e);
          continue;
        }

        const planData = planSnap.data();
        let creatorName = "Unknown";
        let creatorPhoto = "";
        try {
          const uSnap = await getDoc(doc(db, "users", planData.createdBy));
          if (uSnap.exists()) {
            const u = uSnap.data();
            creatorName = u.displayName || u.fullName || u.email || "Unknown";
            creatorPhoto = u.photoURL || "";
          }
        } catch (e) {
          console.warn("Error fetching creator:", e);
        }

        plans.push({
          id: planSnap.id,
          ...planData,
          creatorName,
          creatorPhoto,
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
        toast.error("Failed to load your activity ❌");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDelete = async (planId) => {
    try {
      await deleteDoc(doc(db, "plans", planId));
      setCreatedPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Plan deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan ❌");
    }
  };

  const handleLeave = async (planId) => {
    try {
      const participantId = `${planId}_${user.uid}`;
      await deleteDoc(doc(db, "planParticipants", participantId));
      setJoinedPlanIds((prev) => prev.filter((id) => String(id) !== String(planId)));
      setJoinedPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Left plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave plan ❌");
    }
  };

  if (!user) return <p className="p-6">Please log in to view your activity.</p>;
  if (loading) return <Spinner />;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">📊 My Activity</h1>

      <h2 className="text-xl font-semibold mb-4">📝 Created Plans</h2>
      {createdPlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {createdPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{ name: plan.creatorName, photoURL: plan.creatorPhoto }}
              isCreator={true}
              hasJoined={joinedPlanIds.includes(String(plan.id))}
              onEdit={() => navigate(`/edit-plan/${plan.id}`)}
              onDelete={() => handleDelete(plan.id)}
              onChat={() => navigate(`/chat/${plan.id}`)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic flex items-center gap-2">
          📝 You haven’t created any plans yet.
        </p>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">🤝 Joined Plans</h2>
      {joinedPlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {joinedPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{ name: plan.creatorName, photoURL: plan.creatorPhoto }}
              isCreator={false}
              hasJoined={joinedPlanIds.includes(String(plan.id))}
              onLeave={() => handleLeave(plan.id)}
              onChat={() => navigate(`/chat/${plan.id}`)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic flex items-center gap-2">
          🤝 You haven’t joined any plans yet.
        </p>
      )}
    </div>
  );
}
