// src/components/Card.jsx
import { useEffect, useState } from "react";
import Button from "./Button";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const getRelativeLabel = (date) => {
  if (!date) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

export default function Card({
  plan,
  creator,
  isPast = false,
  isCreator = false,
  hasJoined = false,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
  onChat,
}) {
  const [participants, setParticipants] = useState([]);

  const startDate =
    plan.startDate?.toDate?.() ?? (plan.startDate ? new Date(plan.startDate) : null);

  const endDate =
    plan.endDate?.toDate?.() ?? (plan.endDate ? new Date(plan.endDate) : null);

  useEffect(() => {
    if (!plan?.id) return;
    const q = query(
      collection(db, "planParticipants"),
      where("plan_id", "==", String(plan.id)),
      orderBy("joined_at", "asc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const data = await Promise.all(
        snap.docs.map(async (d) => {
          const p = d.data();
          try {
            const uSnap = await getDoc(doc(db, "users", p.user_id));
            const u = uSnap.exists() ? uSnap.data() : {};
            return {
              name: u.displayName || u.fullName || p.email || "Unknown",
              photoURL: u.photoURL || "",
            };
          } catch {
            return { name: p.email || "Unknown", photoURL: "" };
          }
        })
      );
      setParticipants(data);
    });
    return () => unsub();
  }, [plan?.id]);

  return (
    <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold truncate">{plan.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            isPast
              ? "bg-gray-200 text-gray-700"
              : "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
          }`}
        >
          {isPast ? "Past Plan" : "Active Plan"}
        </span>
      </div>

      {/* Description */}
      {plan.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
          {plan.description}
        </p>
      )}

      {/* Dates */}
      {(startDate || endDate) && (
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
          <span className="font-medium">{getRelativeLabel(startDate)}</span> •{" "}
          {startDate && endDate
            ? `${formatDate(startDate)} → ${formatDate(endDate)}`
            : formatDate(startDate)}
        </p>
      )}

      {/* Creator */}
      <div className="flex items-center gap-2 mb-4">
        {creator?.photoURL ? (
          <img
            src={creator.photoURL}
            alt={creator.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
          Created by <span className="font-medium">{creator?.name}</span>
        </span>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Participants ({participants.length})
        </p>
        {participants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {p.photoURL ? (
                  <img
                    src={p.photoURL}
                    className="w-4 h-4 rounded-full"
                    alt={p.name}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                <span className="truncate">{p.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No participants yet
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap mt-4">
        {isCreator && (
          <>
            <Button onClick={onEdit}>Edit</Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
        {!isCreator && !hasJoined && <Button onClick={onJoin}>I’m In</Button>}
        {!isCreator && hasJoined && (
          <Button variant="danger" onClick={onLeave}>
            Leave Plan
          </Button>
        )}
        {/* ✅ Chat button for both creator and participants */}
        {(isCreator || hasJoined) && onChat && (
          <Button variant="secondary" onClick={() => onChat(plan.id)}>
            💬 Chat
          </Button>
        )}
      </div>

      {isPast && (
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm italic">
          This plan has ended.
        </p>
      )}
    </div>
  );
}
