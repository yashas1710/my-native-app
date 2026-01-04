// src/pages/PlanDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";
import ParticipantsList from "../components/ParticipantsList"; // new component

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const isPast = plan
    ? (plan.endDate?.toDate?.() || new Date(plan.endDate)) < today
    : false;

  // 🔹 Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planRef = doc(db, "plans", id);
        const planSnap = await getDoc(planRef);

        if (planSnap.exists()) {
          const planData = { id: planSnap.id, ...planSnap.data() };
          setPlan(planData);

          if (user && planData.createdBy === user.uid) setIsCreator(true);
        } else {
          toast.error("Plan not found ❌");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching plan ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, user]);

  // 🔹 Fetch participants with user info
  const fetchParticipants = async () => {
    if (!plan) return;
    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", id)
      );
      const snapshot = await getDocs(q);
      const participantData = snapshot.docs.map(doc => doc.data());

      const participantsWithInfo = [];
      for (const p of participantData) {
        const userRef = doc(db, "users", p.user_id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          participantsWithInfo.push({
            id: p.user_id,
            displayName: userSnap.data().displayName || "Unknown",
            photoURL: userSnap.data().photoURL || null,
            email: p.email || "",
          });
        }
      }

      setParticipants(participantsWithInfo);

      if (user) {
        setHasJoined(participantsWithInfo.some(p => p.id === user.uid));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching participants ❌");
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [plan, user]);

  // 🔹 Join plan
  const joinPlan = async () => {
    if (!user) return;
    if (isPast) {
      toast.error("Cannot join a past plan ❌");
      return;
    }
    try {
      await addDoc(collection(db, "planParticipants"), {
        plan_id: id,
        user_id: user.uid,
        email: user.email || "",
        joined_at: new Date(),
      });

      toast.success("You joined the plan ✅");
      await fetchParticipants();
    } catch (err) {
      console.error(err);
      toast.error("Error joining plan ❌");
    }
  };

  // 🔹 Leave plan
  const leavePlan = async () => {
    if (!user || isCreator || isPast) return;
    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", id),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async docSnap => {
        await deleteDoc(doc(db, "planParticipants", docSnap.id));
      });

      toast.success("You left the plan ✅");
      await fetchParticipants();
    } catch (err) {
      console.error(err);
      toast.error("Error leaving plan ❌");
    }
  };

  // 🔹 Delete plan (only creator & active)
  const handleDelete = async () => {
    if (!user || !isCreator || isPast) return;
    try {
      await deleteDoc(doc(db, "plans", plan.id));
      toast.success("Plan deleted ✅", {
        duration: 2000,
        onClose: () => navigate("/activity"),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan ❌");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!plan) return <p className="p-6">Plan not found</p>;

  // 🔹 Relative time display
  const formatDate = (date) => {
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card plan={plan} showButton={false} />

      {/* Dates */}
      <p className="text-gray-500 mt-2">
        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
      </p>

      {/* Buttons */}
      <div className="mt-4 mb-6 flex flex-wrap gap-3">
        {!isCreator && !hasJoined && !isPast && (
          <button
            onClick={joinPlan}
            className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark transition"
          >
            I’m In
          </button>
        )}

        {!isCreator && hasJoined && !isPast && (
          <button
            onClick={leavePlan}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Leave Plan
          </button>
        )}

        {isCreator && !isPast && (
          <>
            <button
              onClick={() => navigate(`/edit-plan/${plan.id}`)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Edit Plan
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Delete Plan
            </button>
          </>
        )}

        {isCreator && isPast && (
          <p className="text-gray-500">Past plans cannot be edited or deleted.</p>
        )}
      </div>

      {/* Participants List with avatars */}
      <ParticipantsList planId={plan.id} />
    </div>
  );
}
