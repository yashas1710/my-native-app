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
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

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
    <div style={{ background: "var(--surface-3)", minHeight: "100vh", padding: "28px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "-0.4px",
            marginBottom: "24px",
            color: "var(--text-1)",
          }}
        >
          My activity
        </h1>

        <section>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "12px",
            }}
          >
            Created
          </div>

          {createdPlans.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
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
            <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
              You haven&apos;t created any plans yet.
            </p>
          )}
        </section>

        <section style={{ marginTop: "32px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "12px",
            }}
          >
            Joined
          </div>

          {joinedPlans.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
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
            <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
              You haven&apos;t joined any plans yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}