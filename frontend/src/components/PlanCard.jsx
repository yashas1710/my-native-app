// src/components/PlanCard.jsx
import { useState, useEffect } from "react";
import { doc, collection, query, where, onSnapshot, addDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function PlanCard({ plan, user }) {
  const [participants, setParticipants] = useState([]);
  const [joined, setJoined] = useState(false);

  // Fetch participants and their names/photos
  useEffect(() => {
    if (!plan?.id) return;

    const participantsRef = collection(db, "planParticipants");
    const q = query(participantsRef, where("planId", "==", plan.id));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const p = docSnap.data();
          try {
            const uSnap = await getDoc(doc(db, "users", p.userId));
            const u = uSnap.exists() ? uSnap.data() : {};
            return {
              id: docSnap.id,
              name: u.name || p.userEmail || "Unknown",
              photoURL: u.photoUrl || "",
              userId: p.userId,
            };
          } catch {
            return {
              id: docSnap.id,
              name: p.userEmail || "Unknown",
              photoURL: "",
              userId: p.userId,
            };
          }
        })
      );

      setParticipants(data);
      setJoined(data.some((p) => p.userId === user.id));
    });

    return () => unsubscribe();
  }, [plan.id, user.id]);

  const handleJoin = async () => {
    try {
      if (joined) return;
      if (plan.max_spots && participants.length >= plan.max_spots) {
        toast.error("Plan is full!");
        return;
      }

      await addDoc(collection(db, "planParticipants"), {
        planId: plan.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.name || "",
        userPhotoUrl: user.photoUrl || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("You're in!");
    } catch (err) {
      console.error("Error joining plan:", err);
      toast.error("Failed to join plan");
    }
  };

  const handleLeave = async () => {
    try {
      const participantDoc = participants.find((p) => p.userId === user.id);
      if (!participantDoc) return;

      await deleteDoc(doc(db, "planParticipants", participantDoc.id));
      toast.success("You left the plan");
    } catch (err) {
      console.error("Error leaving plan:", err);
      toast.error("Failed to leave plan");
    }
  };

  // Exclude creator from participants list for avatars
  const participantAvatars = participants.filter((p) => p.userId !== plan.createdBy);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold">{plan.title}</h2>
      {plan.description && <p className="text-sm mt-1">{plan.description}</p>}
      <p className="text-xs mt-1 text-gray-500">
        {plan.startDate?.seconds
          ? new Date(plan.startDate.seconds * 1000).toLocaleString()
          : plan.startDate?.toDate?.().toLocaleString()}{" "}
        @ {plan.location}
      </p>

      {/* Creator */}
      {plan.creatorName && (
        <div className="mt-2 flex items-center gap-2">
          {plan.creatorPhotoUrl && (
            <img src={plan.creatorPhotoUrl} alt={plan.creatorName} className="w-6 h-6 rounded-full" />
          )}
          <span className="text-sm text-gray-600">
            Created by <span className="font-medium">{plan.creatorName}</span>
          </span>
        </div>
      )}

      {/* Participants */}
      <div className="mt-2 flex items-center space-x-2">
        {participantAvatars.slice(0, 5).map((p) => (
          <div
            key={p.id}
            className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-xs font-bold"
          >
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              p.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {plan.max_spots && (
          <span className="text-xs text-gray-500">
            ({participants.length}/{plan.max_spots})
          </span>
        )}
      </div>

      <button
        className={`mt-3 px-4 py-1 rounded text-white ${joined ? "bg-red-500" : "bg-green-500"}`}
        onClick={joined ? handleLeave : handleJoin}
      >
        {joined ? "Leave Plan" : "I'm In"}
      </button>
    </div>
  );
}
