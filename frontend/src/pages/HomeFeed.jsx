import { useEffect, useState } from "react";
import { plansAPI } from "../api";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activePlans, setActivePlans] = useState([]);
  const [pastPlans, setPastPlans] = useState([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const feedResponse = await plansAPI.getFeed();
        const plansData = feedResponse.data.plans || [];

        const joinedResponse =
          await plansAPI.getMyJoinedPlans();

        const joinedPlans =
          joinedResponse.data.plans || [];

        const joinedIds = new Set(
          joinedPlans.map((p) => p.id)
        );

        setJoinedPlanIds(joinedIds);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activePlansList = [];
        const pastPlansList = [];

        plansData.forEach((plan) => {
          const startDate = new Date(plan.startDate);
          const endDate = plan.endDate
            ? new Date(plan.endDate)
            : null;

          if (
            startDate >= today ||
            !endDate ||
            endDate >= today
          ) {
            activePlansList.push(plan);
          } else {
            pastPlansList.push(plan);
          }
        });

        setActivePlans(activePlansList);
        setPastPlans(pastPlansList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load plans ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleJoin = async (plan) => {
    try {
      if (joinedPlanIds.has(plan.id)) {
        return toast("Already joined this plan", {
          icon: "ℹ️",
        });
      }

      await plansAPI.joinPlan(plan.id);

      setJoinedPlanIds(
        (prev) => new Set([...prev, plan.id])
      );

      toast.success("Joined plan ✅");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message;

      console.error(err);
      toast.error(message + " ❌");
    }
  };

  const handleLeave = async (planId) => {
    try {
      await plansAPI.leavePlan(planId);

      setJoinedPlanIds((prev) => {
  const updated = new Set(prev);
  updated.delete(planId);
  return updated;
});

      toast.success("Left plan ✅");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message;

      console.error(err);
      toast.error(message + " ❌");
    }
  };

  const handleDelete = async (planId) => {
    try {
      await plansAPI.deletePlan(planId);

      setActivePlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );

      setPastPlans((prev) =>
        prev.filter((p) => p.id !== planId)
      );

      toast.success("Plan deleted ✅");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message;

      console.error(err);
      toast.error(message + " ❌");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-7 bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">
        🏠 Home Feed
      </h1>

      <h2 className="text-2xl font-semibold mb-4">
        🌱 Active Plans
      </h2>

      {activePlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {activePlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{
                name:
                  plan.creatorName || "Unknown",
                photoURL:
                  plan.creatorPhotoUrl || "",
              }}
              isCreator={
                user?.id === plan.createdBy
              }
              hasJoined={joinedPlanIds.has(
                plan.id
              )}
              onJoin={() => handleJoin(plan)}
              onLeave={() =>
                handleLeave(plan.id)
              }
              onEdit={() =>
                navigate(
                  `/edit-plan/${plan.id}`
                )
              }
              onDelete={() =>
                handleDelete(plan.id)
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          🌱 No active plans right now.
        </p>
      )}

      <h2 className="text-2xl font-semibold mb-4">
        📜 Past Plans
      </h2>

      {pastPlans.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pastPlans.map((plan) => (
            <Card
              key={plan.id}
              plan={plan}
              creator={{
                name:
                  plan.creatorName || "Unknown",
                photoURL:
                  plan.creatorPhotoUrl || "",
              }}
              isCreator={
                user?.id === plan.createdBy
              }
              hasJoined={joinedPlanIds.has(
                plan.id
              )}
              isPast
              onEdit={() =>
                navigate(
                  `/edit-plan/${plan.id}`
                )
              }
              onDelete={() =>
                handleDelete(plan.id)
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          📜 No past plans yet.
        </p>
      )}
    </div>
  );
}