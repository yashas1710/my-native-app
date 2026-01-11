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

export default function Card({
  plan,
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
  const [creator, setCreator] = useState({
    name: plan.creatorName || "Anonymous",
    photoURL: plan.creatorPhotoURL || "",
  });

  const startDate =
    plan.startDate?.toDate?.() ??
    (plan.startDate ? new Date(plan.startDate) : null);

  const endDate =
    plan.endDate?.toDate?.() ??
    (plan.endDate ? new Date(plan.endDate) : null);

  // fetch creator if missing
  useEffect(() => {
    if (plan.creatorName || !plan.createdBy) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", plan.createdBy));
        if (snap.exists()) {
          const u = snap.data();
          setCreator({
            name: u.displayName || u.name || u.email || "Anonymous",
            photoURL: u.photoURL || "",
          });
        }
      } catch {
        setCreator({ name: "Anonymous", photoURL: "" });
      }
    })();
  }, [plan.creatorName, plan.createdBy]);

  // fetch participants
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
              name: u.displayName || p.email || "Unknown",
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
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition p-5 border border-gray-200">
      {/* Header with badge */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{plan.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            isPast ? "bg-gray-200 text-gray-700" : "bg-green-200 text-green-800"
          }`}
        >
          {isPast ? "Past Plan" : "Active Plan"}
        </span>
      </div>

      {/* Description */}
      {plan.description && (
        <p className="text-gray-700 mb-2">{plan.description}</p>
      )}

      {/* Dates */}
      {(startDate || endDate) && (
        <p className="text-gray-500 mb-2 text-sm">
          <span className="font-medium">{getRelativeLabel(startDate)}</span>{" "}
          •{" "}
          {startDate && endDate
            ? `${startDate.toLocaleString()} → ${endDate.toLocaleString()}`
            : startDate?.toLocaleString()}
        </p>
      )}

      {/* Creator */}
      <div className="flex items-center gap-2 mb-3">
        {creator.photoURL && (
          <img
            src={creator.photoURL}
            alt={creator.name}
            className="w-7 h-7 rounded-full"
          />
        )}
        <span className="text-sm text-gray-600">
          Created by <span className="font-medium">{creator.name}</span>
        </span>
      </div>

      {/* Participants */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-600 mb-1">Participants:</p>
        {participants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-gray-100 rounded flex items-center gap-1"
              >
                {p.photoURL ? (
                  <img
                    src={p.photoURL}
                    className="w-4 h-4 rounded-full"
                    alt={p.name}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                )}
                {p.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No participants yet</p>
        )}
      </div>

      {/* Action buttons */}
      {!isPast && (
        <div className="flex gap-2 flex-wrap mt-4">
          {isCreator && (
            <>
              <Button onClick={onEdit}>Edit</Button>
              <Button variant="danger" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
          {!isCreator && !hasJoined && (
            <Button onClick={onJoin}>I’m In</Button>
          )}
          {!isCreator && hasJoined && (
            <Button variant="danger" onClick={onLeave}>
              Leave Plan
            </Button>
          )}
          {hasJoined && typeof onChat === "function" && (
            <Button variant="secondary" onClick={() => onChat(plan.id)}>
              Chat
            </Button>
          )}
        </div>
      )}

      {isPast && (
        <p className="text-gray-500 mt-3 text-sm italic">
          This plan has ended.
        </p>
      )}
    </div>
  );
}
