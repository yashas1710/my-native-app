// src/pages/PlanDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function PlanDetail() {
  const { id } = useParams(); // planId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) {
        console.error("Plan ID missing");
        return;
      }

      try {
        // Fetch plan
        const planRef = doc(db, "plans", id);
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) {
          toast.error("Plan not found ❌");
          navigate("/");
          return;
        }
        const planData = planSnap.data();
        setPlan({ id: planSnap.id, ...planData });

        // Fetch participants only if id is valid
        const q = query(
          collection(db, "planParticipants"),
          where("plan_id", "==", String(id))
        );
        const snap = await getDocs(q);
        const list = await Promise.all(
          snap.docs.map(async (d) => {
            const p = d.data();
            try {
              const uSnap = await getDoc(doc(db, "users", p.user_id));
              const u = uSnap.exists() ? uSnap.data() : {};
              return {
                id: d.id,
                name: u.displayName || u.fullName || p.email || "Unknown",
                photoURL: u.photoURL || "",
              };
            } catch {
              return { id: d.id, name: p.email || "Unknown", photoURL: "" };
            }
          })
        );
        setParticipants(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plan ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (!plan) return <p className="p-6">Plan not found.</p>;

  const startDate =
    plan.startDate?.toDate?.() ?? (plan.startDate ? new Date(plan.startDate) : null);
  const endDate =
    plan.endDate?.toDate?.() ?? (plan.endDate ? new Date(plan.endDate) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-blue-400">
          {plan.title}
        </h1>

        {plan.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{plan.description}</p>
        )}

        {(startDate || endDate) && (
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            {startDate &&
              `Starts: ${startDate.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}`}
            {endDate &&
              ` • Ends: ${endDate.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}`}
          </p>
        )}

        <div className="flex items-center gap-2 mb-6">
          {plan.creatorPhotoURL ? (
            <img
              src={plan.creatorPhotoURL}
              alt={plan.creatorName}
              className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Created by <span className="font-medium">{plan.creatorName}</span>
          </span>
        </div>

        {/* Participants */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Participants ({participants.length})
          </p>
          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {p.photoURL ? (
                    <img
                      src={p.photoURL}
                      className="w-4 h-4 rounded-full"
                      alt={p.name}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="truncate">{p.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No participants yet
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Creator can edit/delete */}
          {user?.uid === plan.createdBy && (
            <>
              <button
                onClick={() => navigate(`/edit-plan/${plan.id}`)}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => toast("Delete logic here")}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </>
          )}

          {/* Chat button for creator OR participant */}
          {(user?.uid === plan.createdBy ||
            participants.some((p) => p.id === `${plan.id}_${user?.uid}`)) && (
            <button
              onClick={() => navigate(`/chat/${plan.id}`)}
              className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition"
            >
              💬 Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
