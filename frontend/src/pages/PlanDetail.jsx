import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { plansAPI } from "../api";
import { useAuth } from "../context/AuthContext";

import toast, {
  Toaster,
} from "react-hot-toast";

import Spinner from "../components/Spinner";

export default function PlanDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [plan, setPlan] =
    useState(null);

  const [participants, setParticipants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isParticipant, setIsParticipant] =
    useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;

      try {
        const response =
          await plansAPI.getPlanById(id);

        setPlan(response.data.plan);

        setParticipants(
          response.data.participants || []
        );

        setIsParticipant(
          response.data.isParticipant ||
            false
        );
      } catch (err) {
        console.error(err);

        toast.error(
          "Failed to fetch plan ❌"
        );

        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  if (loading) return <Spinner />;

  if (!plan) {
    return (
      <p className="p-6">
        Plan not found.
      </p>
    );
  }

  const startDate = plan.startDate
    ? new Date(plan.startDate)
    : null;

  const endDate = plan.endDate
    ? new Date(plan.endDate)
    : null;

  const isCreator =
    user?.id === plan.createdBy;

  const handleDelete = async () => {
    try {
      await plansAPI.deletePlan(
        plan.id
      );

      toast.success(
        "Plan deleted ✅"
      );

      navigate("/activity");
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to delete plan ❌"
      );
    }
  };

  const handleJoinLeave = async () => {
    try {
      if (isParticipant) {
        await plansAPI.leavePlan(
          plan.id
        );

        toast.success(
          "Left plan ✅"
        );
      } else {
        await plansAPI.joinPlan(
          plan.id
        );

        toast.success(
          "Joined plan ✅"
        );
      }

      const response =
        await plansAPI.getPlanById(id);

      setPlan(response.data.plan);

      setParticipants(
        response.data.participants || []
      );

      setIsParticipant(
        response.data.isParticipant ||
          false
      );
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message;

      toast.error(message + " ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" />

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-600 dark:text-blue-400">
          {plan.title}
        </h1>

        {plan.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {plan.description}
          </p>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          📍 {plan.location}
        </p>

        {startDate && (
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Starts:{" "}
            {startDate.toLocaleString()}
          </p>
        )}

        {endDate && (
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Ends:{" "}
            {endDate.toLocaleString()}
          </p>
        )}

        {plan.maxSpots && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            📊 Capacity:{" "}
            {participants.length}/
            {plan.maxSpots}
          </p>
        )}

        <div className="flex items-center gap-2 mb-6">
          {plan.creatorPhotoUrl ? (
            <img
              src={plan.creatorPhotoUrl}
              alt={plan.creatorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}

          <span className="text-sm text-gray-600 dark:text-gray-300">
            Created by{" "}
            <span className="font-medium">
              {plan.creatorName ||
                "Unknown"}
            </span>
          </span>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Participants (
            {participants.length})
          </p>

          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1"
                >
                  {p.userPhotoUrl ? (
                    <img
                      src={
                        p.userPhotoUrl
                      }
                      className="w-4 h-4 rounded-full"
                      alt={
                        p.userName
                      }
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}

                  <span>
                    {p.userName ||
                      p.userEmail ||
                      "Unknown"}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No participants yet
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {isCreator ? (
            <>
              <button
                onClick={() =>
                  navigate(
                    `/edit-plan/${plan.id}`
                  )
                }
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                Edit
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={
                handleJoinLeave
              }
              className={`px-4 py-2 rounded text-white ${
                isParticipant
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
            >
              {isParticipant
                ? "Leave Plan"
                : "Join Plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}