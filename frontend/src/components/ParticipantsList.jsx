// src/components/ParticipantsList.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ParticipantsList({ planId }) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const q = query(collection(db, "planParticipants"), where("plan_id", "==", planId));
        const snapshot = await getDocs(q);
        const participantData = snapshot.docs.map(d => d.data());

        const enrichedParticipants = [];
        for (const p of participantData) {
          const userRef = doc(db, "users", p.user_id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            enrichedParticipants.push({
              id: p.user_id,
              displayName: userSnap.data().displayName || "Unknown",
              photoURL: userSnap.data().photoURL || null,
              email: p.email || "",
            });
          } else {
            enrichedParticipants.push({
              id: p.user_id,
              displayName: p.email || "Unknown",
              photoURL: null,
            });
          }
        }

        setParticipants(enrichedParticipants);
      } catch (err) {
        console.error(err);
      }
    };

    fetchParticipants();
  }, [planId]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Participants</h3>
      <ul className="space-y-2">
        {participants.length > 0 ? (
          participants.map(p => (
            <li key={p.id} className="flex items-center gap-2">
              {p.photoURL ? (
                <img
                  src={p.photoURL}
                  alt={p.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                  {p.displayName?.[0] || "?"}
                </div>
              )}
              <span>{p.displayName}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No participants yet</p>
        )}
      </ul>
    </div>
  );
}
