import { useEffect, useState } from "react";
import { plansAPI } from "../api";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);

        const createdResponse = await plansAPI.getMyCreatedPlans();
        const joinedResponse = await plansAPI.getMyJoinedPlans();

        setCreatedPlans(createdResponse.data.plans || []);
        setJoinedPlans(joinedResponse.data.plans || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your activity ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user]);

  const handleDelete = async (planId) => {
    try {
      await plansAPI.deletePlan(planId);

      setCreatedPlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );

      toast.success("Plan deleted ✅");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error(err);
      toast.error(message + " ❌");
    }
  };

  const handleLeave = async (planId) => {
    try {
      await plansAPI.leavePlan(planId);

      setJoinedPlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );

      toast.success("Left plan ✅");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error(err);
      toast.error(message + " ❌");
    }
  };

  if (!user) {
    return (
      <p className="p-6">
        Please log in to view your activity.
      </p>
    );
  }

  if (loading) return <Spinner />;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">
        📊 My Activity
      </h1>

      <h2 className="text-xl font-semibold mb-4">
        📝 Created Plans
      </h2>

      {createdPlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {createdPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{
                name: plan.creatorName || "Unknown",
                photoURL: plan.creatorPhotoUrl || "",
              }}
              isCreator={true}
              onEdit={() =>
                navigate(`/edit-plan/${plan.id}`)
              }
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          📝 You haven’t created any plans yet.
        </p>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">
        🤝 Joined Plans
      </h2>

      {joinedPlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {joinedPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{
                name: plan.creatorName || "Unknown",
                photoURL: plan.creatorPhotoUrl || "",
              }}
              isCreator={false}
              onLeave={() => handleLeave(plan.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          🤝 You haven’t joined any plans yet.
        </p>
      )}
    </div>
  );
}