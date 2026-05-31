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

        setActivePlans(plansData);
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
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

    try {
      await plansAPI.deletePlan(planId);

      setActivePlans((prev) =>
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
    <div
      style={{
        background: "var(--surface-3)",
        minHeight: "100vh",
        padding: "28px 24px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <header style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--text-1)",
              letterSpacing: "-0.4px",
              margin: 0,
            }}
          >
            What&apos;s on today
          </h1>
          <p
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "var(--text-2)",
            }}
          >
            {user?.accommodationId} · {activePlans.length} active plans
          </p>
        </header>

        {activePlans.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "14px",
            }}
          >
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
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "14px",
              }}
            >
              No plans right now. Be the first to create one.
            </div>

            <button
              type="button"
              onClick={() => navigate("/create")}
              style={{
                marginTop: "14px",
                background: "var(--brand)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              + Create plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}