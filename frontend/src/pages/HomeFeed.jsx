import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore";
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
    const fetchPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "plans"));
        const plansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const today = new Date();
        setActivePlans(plansData.filter(plan => (plan.endDate?.toDate?.() ?? new Date(plan.endDate)) >= today));
        setPastPlans(plansData.filter(plan => (plan.endDate?.toDate?.() ?? new Date(plan.endDate)) < today));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load plans");
      } finally { setLoading(false); }
    };

    const fetchJoined = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "planParticipants"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        setJoinedPlanIds(snapshot.docs.map(d => d.data().plan_id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
    fetchJoined();
  }, [user]);

  const handleJoin = async (planId) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "planParticipants"), {
        plan_id: planId,
        user_id: user.uid,
        email: user.email || "",
        joined_at: new Date(),
      });
      setJoinedPlanIds(prev => [...prev, planId]);
      toast.success("You joined the plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to join plan ❌");
    }
  };

  const handleLeave = async (planId) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", planId),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docItem => deleteDoc(doc(db, "planParticipants", docItem.id)));
      setJoinedPlanIds(prev => prev.filter(id => id !== planId));
      toast.success("You left the plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave plan ❌");
    }
  };

  const handleEdit = (planId) => {
    navigate(`/edit-plan/${planId}`);
  };

  const handleDelete = async (planId) => {
    try {
      await deleteDoc(doc(db, "plans", planId));
      setActivePlans(prev => prev.filter(p => p.id !== planId));
      setPastPlans(prev => prev.filter(p => p.id !== planId));
      toast.success("Plan deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan ❌");
    }
  };

  if (loading) return <p className="p-6">Loading plans...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-brand-dark">Home Feed</h1>

      <h2 className="text-2xl font-semibold mb-4 text-green-700">Active Plans</h2>
      {activePlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {activePlans.map(plan => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={user?.uid === plan.createdBy}
              hasJoined={joinedPlanIds.includes(plan.id)}
              onJoin={() => handleJoin(plan.id)}
              onLeave={() => handleLeave(plan.id)}
              onEdit={() => handleEdit(plan.id)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      ) : <p className="text-gray-500 mb-8">No active plans right now.</p>}

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Past Plans</h2>
      {pastPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastPlans.map(plan => (
            <Card
              key={plan.id}
              plan={plan}
              isCreator={user?.uid === plan.createdBy}
              hasJoined={joinedPlanIds.includes(plan.id)}
              onLeave={() => handleLeave(plan.id)}
              isPast
            />
          ))}
        </div>
      ) : <p className="text-gray-500">No past plans yet.</p>}
    </div>
  );
}
