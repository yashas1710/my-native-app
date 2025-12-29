import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function HomeFeed() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/plans");
        const now = Date.now();
        const plans = res.data.plans || [];

        setUpcoming(plans.filter((p) => new Date(p.datetime).getTime() >= now));
        setPast(plans.filter((p) => new Date(p.datetime).getTime() < now));
      } catch (err) {
        console.error("Plans error:", err.response?.data);
        toast.error(err.response?.data?.msg || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;

  const PlanCard = ({ plan, past }) => (
    <Link
      to={`/plans/${plan._id}`}
      className={`block rounded-lg border p-4 shadow-sm hover:shadow-md transition ${
        past ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg mb-1">{plan.title}</h3>
          <p className="text-sm text-gray-600">
            {new Date(plan.datetime).toLocaleString()} • {plan.location}
          </p>
          <p className="text-sm text-gray-500">
            By {plan.creator_id?.name || "Unknown"}
          </p>
        </div>
        <div className="text-right text-sm">
          <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
            {plan.participants_count || 0} {past ? "attended" : "going"}
          </span>
          {!past && plan.max_spots ? (
            <p className="text-gray-600 mt-1">
              {plan.max_spots - plan.participants_count} spots left
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-4">
      {/* Upcoming Plans */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Upcoming Plans</h2>
        <Link
          to="/create"
          className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition"
        >
          + Create Plan
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center text-gray-500 italic mb-6">
          No upcoming plans yet. Create one!
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {upcoming.map((p) => (
            <PlanCard key={p._id} plan={p} />
          ))}
        </div>
      )}

      {/* Past Plans */}
      <h2 className="text-2xl font-bold mb-4">Past Plans</h2>
      {past.length === 0 ? (
        <div className="text-center text-gray-500 italic">No past plans yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {past.map((p) => (
            <PlanCard key={p._id} plan={p} past />
          ))}
        </div>
      )}
    </div>
  );
}
