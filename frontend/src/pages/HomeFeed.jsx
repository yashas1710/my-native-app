import { useEffect, useState } from "react";
import { authAPI, plansAPI } from "../api";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import useGeolocation from "../hooks/useGeolocation";

export default function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const geolocation = useGeolocation();

  const [activePlans, setActivePlans] = useState([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [locationFallback, setLocationFallback] = useState(false);

  useEffect(() => {
    if (!user || geolocation.status === "idle" || geolocation.status === "loading") return;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (geolocation.status === "granted") {
          try {
            await authAPI.updateLocation(geolocation.latitude, geolocation.longitude);
          } catch (locationError) {
            console.error("Failed to save location:", locationError);
          }
        }

        const feedResponse = await plansAPI.getFeed();
        const plansData = feedResponse.data.plans || [];
        setLocationFallback(geolocation.status !== "granted" || feedResponse.data.locationFallback === true);

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
  }, [user, geolocation.status, geolocation.latitude, geolocation.longitude]);

  const retryLocation = async () => {
    setLoading(true);
    await geolocation.retry();
  };

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

  if (loading && (geolocation.status === "idle" || geolocation.status === "loading")) {
    return <div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--text-2)" }}>Checking your location and loading plans…</div>;
  }
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
        {locationFallback && (
          <div role="status" style={{ marginBottom: "16px", padding: "12px 14px", borderRadius: "8px", background: "var(--surface)", color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
            <span>Enable location to see plans near you</span>
            <button type="button" onClick={retryLocation} style={{ border: 0, background: "transparent", color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>Retry</button>
          </div>
        )}
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
