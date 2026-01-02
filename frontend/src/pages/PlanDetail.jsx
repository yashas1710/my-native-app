// src/pages/PlanDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatDate";
import Card from "../components/Card";

export default function PlanDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      const docRef = doc(db, "plans", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPlan({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchPlan();
  }, [id]);

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      const q = query(collection(db, "planParticipants"), where("plan_id", "==", id));
      const querySnapshot = await getDocs(q);
      const participantsData = querySnapshot.docs.map((doc) => doc.data());
      setParticipants(participantsData);
    };
    fetchParticipants();
  }, [id]);

  // Join plan
  const joinPlan = async () => {
    if (!user) return;
    await addDoc(collection(db, "planParticipants"), {
      plan_id: id,
      user_id: user.uid,
      email: user.email,
      joined_at: new Date(),
    });
    alert("You joined this plan!");
    // Refresh participants list
    const q = query(collection(db, "planParticipants"), where("plan_id", "==", id));
    const querySnapshot = await getDocs(q);
    setParticipants(querySnapshot.docs.map((doc) => doc.data()));
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!plan) return <p className="p-6">Plan not found</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card plan={plan} showButton={false} />

      {user && (
        <div className="mt-4">
          <button
            onClick={joinPlan}
            className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark transition mb-6"
          >
            I’m In
          </button>
        </div>
      )}

      <div className="mt-6 bg-white rounded shadow-card p-4">
        <h2 className="text-xl font-semibold mb-2 text-brand">Participants</h2>
        {participants.length > 0 ? (
          <ul className="space-y-2">
            {participants.map((p, idx) => (
              <li
                key={idx}
                className="bg-gray-100 px-3 py-2 rounded text-gray-700 shadow-sm"
              >
                {p.email}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No one has joined yet.</p>
        )}
      </div>
    </div>
  );
}
