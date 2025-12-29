import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function MyActivity() {
  const [createdUpcoming, setCreatedUpcoming] = useState([]);
  const [createdPast, setCreatedPast] = useState([]);
  const [joinedUpcoming, setJoinedUpcoming] = useState([]);
  const [joinedPast, setJoinedPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, j] = await Promise.all([
          api.get("/plans/me/created"),
          api.get("/plans/me/joined"),
        ]);
        const now = Date.now();
        const split = (list) => ({
          upcoming: list.filter((p) => new Date(p.datetime).getTime() >= now),
          past: list.filter((p) => new Date(p.datetime).getTime() < now),
        });
        const cSplit = split(c.data.plans || []);
        const jSplit = split(j.data.plans || []);
        setCreatedUpcoming(cSplit.upcoming);
        setCreatedPast(cSplit.past);
        setJoinedUpcoming(jSplit.upcoming);
        setJoinedPast(jSplit.past);
      } catch (err) {
        toast.error(err.response?.data?.msg || "Failed to load activity");
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
        </div>
        <div className="text-right text-sm">
          <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
            {plan.participants?.length || 0} {past ? "attended" : "going"}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Activity</h2>

      <h3 className="text-xl font-semibold mb-2">Upcoming — Created by me</h3>
      {createdUpcoming.length === 0 ? (
        <div className="text-gray-500 italic mb-4">No upcoming created plans.</div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {createdUpcoming.map((p) => (
            <PlanCard key={p._id} plan={p} />
          ))}
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Upcoming — Joined by me</h3>
      {joinedUpcoming.length === 0 ? (
        <div className="text-gray-500 italic mb-6">No upcoming joined plans.</div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {joinedUpcoming.map((p) => (
            <PlanCard key={p._id} plan={p} />
          ))}
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Past — Created by me</h3>
      {createdPast.length === 0 ? (
        <div className="text-gray-500 italic mb-4">No past created plans.</div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {createdPast.map((p) => (
            <PlanCard key={p._id} plan={p} past />
          ))}
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Past — Joined by me</h3>
      {joinedPast.length === 0 ? (
        <div className="text-gray-500 italic">No past joined plans.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {joinedPast.map((p) => (
            <PlanCard key={p._id} plan={p} past />
          ))}
        </div>
      )}
    </div>
  );
}
