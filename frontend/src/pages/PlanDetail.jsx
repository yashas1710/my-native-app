import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

export default function PlanDetail() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/plans/${id}`);
        setPlan(res.data.plan);
      } catch (err) {
        toast.error(err.response?.data?.msg || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const join = async () => {
    try {
      const res = await api.post(`/plans/${id}/join`);
      toast.success(res.data.msg || "Joined plan!");
      const updated = await api.get(`/plans/${id}`);
      setPlan(updated.data.plan);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to join");
    }
  };

  if (loading) return <Loader />;
  if (!plan) return <div className="p-4">Plan not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{plan.title}</h2>
        <div className="text-right">
          <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            {plan.participants?.length || 0} going
          </span>
          {plan.max_spots ? (
            <p className="text-gray-600 text-xs mt-1">
              {plan.max_spots - (plan.participants?.length || 0)} spots left
            </p>
          ) : null}
        </div>
      </div>

      <p className="mb-2">{plan.description}</p>
      <p className="text-gray-600 mb-2">
        {new Date(plan.datetime).toLocaleString()} • {plan.location}
      </p>
      <p className="mb-4 text-sm text-gray-500">
        Created by {plan.creator_id?.name || "Unknown"}
      </p>

      <button
        onClick={join}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition mb-6"
      >
        Join Plan
      </button>

      <h3 className="text-xl font-semibold mb-2">Participants</h3>
      {!plan.participants || plan.participants.length === 0 ? (
        <p className="text-gray-500 italic">No one has joined yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {plan.participants.map((p) => (
            <li key={p._id}>{p.name || p.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
