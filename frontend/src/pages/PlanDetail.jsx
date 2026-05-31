import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { plansAPI } from "../api";
import { useAuth } from "../context/AuthContext";

import toast from "react-hot-toast";

import Spinner from "../components/Spinner";

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;

      try {
        const response = await plansAPI.getPlanById(id);
        setPlan(response.data.plan || null);
        setParticipants(response.data.participants || []);
        setIsParticipant(response.data.isParticipant || false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plan");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  if (loading) return <Spinner />;

  if (!plan) {
    return <p className="p-6">Plan not found.</p>;
  }

  const isFull = plan.maxSpots && participants.length >= plan.maxSpots;
  const isCreator = user?.id === plan.createdBy;

  const formatFullDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} • ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (!confirm("Delete this plan? This cannot be undone.")) return;

    try {
      await plansAPI.deletePlan(plan.id);
      toast.success("Plan deleted");
      navigate("/activity");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  const handleJoinLeave = async () => {
    try {
      if (isParticipant) {
        await plansAPI.leavePlan(plan.id);
        toast.success("Left plan");
        setIsParticipant(false);
        setParticipants((s) => s.filter((p) => p.id !== user?.id));
      } else {
        await plansAPI.joinPlan(plan.id);
        toast.success("Joined plan");
        setIsParticipant(true);
        setParticipants((s) => [...s, { id: user?.id, userName: user?.name, userPhotoUrl: user?.photoUrl }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{plan.title}</h1>

        {plan.description && <p className="text-gray-700 dark:text-gray-300 mb-4">{plan.description}</p>}

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">📍 {plan.location}</p>

        {plan.startDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Starts: {formatFullDate(plan.startDate)}</p>
        )}

        {plan.endDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ends: {formatFullDate(plan.endDate)}</p>
        )}

        {plan.maxSpots && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">📊 Capacity: {participants.length}/{plan.maxSpots}</p>
        )}

        <div className="flex items-center gap-3 mb-6">
          {plan.creatorPhotoUrl ? (
            <img src={plan.creatorPhotoUrl} alt={plan.creatorName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm text-white">{getInitials(plan.creatorName)}</div>
          )}

          <div className="text-sm text-gray-700 dark:text-gray-300">
            Created by <span className="font-medium">{plan.creatorName || "Unknown"}</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants ({participants.length})</p>

          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <span key={p.id} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-2">
                  {p.userPhotoUrl ? (
                    <img src={p.userPhotoUrl} className="w-5 h-5 rounded-full" alt={p.userName} />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">{getInitials(p.userName)}</div>
                  )}
                  <span>{p.userName || p.userEmail || 'Unknown'}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No participants yet</p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {isCreator ? (
            <>
              <button onClick={() => navigate(`/edit-plan/${plan.id}`)} className="px-4 py-2 rounded bg-blue-600 text-white">Edit</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
            </>
          ) : (
            <button disabled={!isParticipant && isFull} onClick={handleJoinLeave} className={`px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed ${isParticipant ? 'bg-orange-500' : isFull ? 'bg-gray-500' : 'bg-green-600'}`}>
              {isParticipant ? 'Leave Plan' : isFull ? 'Full 🔒' : 'Join Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}