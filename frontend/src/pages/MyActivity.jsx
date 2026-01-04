import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCreatedPlans = async () => {
      const q = query(collection(db, "plans"), where("createdBy", "==", user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchJoinedPlans = async () => {
      const q = query(collection(db, "planParticipants"), where("user_id", "==", user.uid));
      const snapshot = await getDocs(q);
      const joinedData = snapshot.docs.map(doc => doc.data());
      const plans = [];
      for (const p of joinedData) {
        const planRef = doc(db, "plans", p.plan_id);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) plans.push({ id: planSnap.id, ...planSnap.data(), userJoined: true });
      }
      return plans;
    };

    (async () => {
      try {
        const created = await fetchCreatedPlans();
        const joined = await fetchJoinedPlans();
        setCreatedPlans(created);
        setJoinedPlans(joined);
      } catch (err) { console.error(err); toast.error("Error fetching activity"); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) return <p className="p-6">Please login to view your activity.</p>;
  if (loading) return <p className="p-6">Loading plans...</p>;

  const handleDelete = async (planId) => {
    try {
      await deleteDoc(doc(db, "plans", planId));
      setCreatedPlans(prev => prev.filter(p => p.id !== planId));
      toast.success("Plan deleted ✅");
    } catch (err) { console.error(err); toast.error("Failed to delete plan"); }
  };

  const handleLeave = async (planId) => {
    try {
      const q = query(collection(db, "planParticipants"), where("plan_id", "==", planId), where("user_id", "==", user.uid));
      const snapshot = await getDocs(q);
      snapshot.forEach(docItem => deleteDoc(doc(db, "planParticipants", docItem.id)));
      setJoinedPlans(prev => prev.filter(p => p.id !== planId));
      toast.success("You left the plan ✅");
    } catch (err) { console.error(err); toast.error("Failed to leave plan"); }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-brand-dark">My Activity</h1>

      <h2 className="text-xl font-semibold mb-4 text-brand">Created Plans</h2>
      {createdPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {createdPlans.map(plan => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={true}
              hasJoined={false}
              onEdit={() => navigate(`/edit-plan/${plan.id}`)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      ) : <p className="text-gray-500 mb-6">You haven’t created any plans yet.</p>}

      <h2 className="text-xl font-semibold mb-4 text-brand mt-8">Joined Plans</h2>
      {joinedPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {joinedPlans.map(plan => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={false}
              hasJoined={true}
              onLeave={() => handleLeave(plan.id)}
            />
          ))}
        </div>
      ) : <p className="text-gray-500">You haven’t joined any plans yet.</p>}
    </div>
  );
}
