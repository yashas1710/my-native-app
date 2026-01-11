// src/pages/HomeFeed.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activePlans, setActivePlans] = useState([]);
  const [pastPlans, setPastPlans] = useState([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      try {
        const planSnap = await getDocs(collection(db, "plans"));
        const plansData = await Promise.all(
          planSnap.docs.map(async (d) => {
            const data = d.data();
            let creatorName = "Anonymous";
            let creatorPhoto = "";
            if (data.createdBy) {
              const userDoc = await getDoc(doc(db, "users", data.createdBy));
              if (userDoc.exists()) {
                const u = userDoc.data();
                creatorName = u.displayName || "Anonymous";
                creatorPhoto = u.photoURL || "";
              }
            }
            return { id: d.id, ...data, creatorName, creatorPhoto };
          })
        );

        const today = new Date();
        setActivePlans(
          plansData.filter((p) => {
            const start = p.startDate?.toDate?.() ?? new Date(p.startDate);
            const end = p.endDate?.toDate?.() ?? (p.endDate ? new Date(p.endDate) : null);
            return start >= today || (!end || end >= today);
          })
        );
        setPastPlans(
          plansData.filter((p) => {
            const end = p.endDate?.toDate?.() ?? (p.endDate ? new Date(p.endDate) : null);
            return end && end < today;
          })
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    const fetchJoined = async () => {
      try {
        const q = query(collection(db, "planParticipants"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        setJoinedPlanIds(snapshot.docs.map((d) => String(d.data().plan_id)));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
    fetchJoined();
  }, [user]);

  const handleJoin = async (planId) => {
    try {
      const existsQ = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", String(planId)),
        where("user_id", "==", user.uid)
      );
      const existsSnap = await getDocs(existsQ);
      if (!existsSnap.empty) return toast("Already joined", { icon: "ℹ️" });

      await addDoc(collection(db, "planParticipants"), {
        plan_id: String(planId),
        user_id: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        photoURL: user.photoURL || "",
        joined_at: serverTimestamp(),
      });
      setJoinedPlanIds((prev) => [...prev, String(planId)]);
      toast.success("Joined plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to join plan ❌");
    }
  };

  const handleLeave = async (planId) => {
    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", String(planId)),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, "planParticipants", d.id))));
      setJoinedPlanIds((prev) => prev.filter((id) => String(id) !== String(planId)));
      toast.success("Left plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave plan ❌");
    }
  };

  const handleDelete = async (planId) => {
    try {
      await deleteDoc(doc(db, "plans", planId));
      setActivePlans((prev) => prev.filter((p) => p.id !== planId));
      setPastPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Plan deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan ❌");
    }
  };

  if (loading) return <p className="p-6">Loading plans...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-brand-dark">Home Feed</h1>

      <h2 className="text-2xl font-semibold mb-4 text-green-700">Active Plans</h2>
      {activePlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {activePlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={user?.uid === plan.createdBy}
              hasJoined={joinedPlanIds.includes(String(plan.id))}
              onJoin={() => handleJoin(plan.id)}
              onLeave={() => handleLeave(plan.id)}
              onEdit={() => navigate(`/edit-plan/${plan.id}`)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">No active plans right now.</p>
      )}

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Past Plans</h2>
      {pastPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={user?.uid === plan.createdBy}
              hasJoined={joinedPlanIds.includes(String(plan.id))}
              isPast
              onEdit={() => navigate(`/edit-plan/${plan.id}`)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No past plans yet.</p>
      )}
    </div>
  );
}
