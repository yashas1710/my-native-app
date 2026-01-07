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
  const diffDays = Math.round(
    (target - today) / (1000 * 60 * 60 * 24)
  );

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
  onChat, // 🔥 passed from parent
}) {
  const [participants, setParticipants] = useState([]);

  const startDate =
    plan.startDate?.toDate?.() ??
    (plan.startDate ? new Date(plan.startDate) : null);

  const endDate =
    plan.endDate?.toDate?.() ??
    (plan.endDate ? new Date(plan.endDate) : null);

  // ---------- Real-time participants ----------
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
    <div
      className={`bg-white rounded shadow p-4 border-l-4 ${
        isPast ? "border-gray-300" : "border-blue-400"
      }`}
    >
      <h3 className="text-xl font-semibold mb-1">{plan.title}</h3>
      <p className="text-gray-700 mb-2">{plan.description}</p>

      {(startDate || endDate) && (
        <p className="text-gray-500 mb-2">
          <span className="font-medium">
            {getRelativeLabel(startDate)}
          </span>{" "}
          •{" "}
          {startDate && endDate
            ? `${startDate.toLocaleString()} → ${endDate.toLocaleString()}`
            : ""}
        </p>
      )}

      <div className="flex items-center gap-2 mb-3">
        {plan.creatorPhotoURL && (
          <img
            src={plan.creatorPhotoURL}
            alt={plan.creatorName}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-gray-600">
          Created by{" "}
          <span className="font-medium">
            {plan.creatorName || "Anonymous"}
          </span>
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-600 mb-1">
          Participants:
        </p>
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

          {/* ✅ CHAT BUTTON */}
          {hasJoined && typeof onChat === "function" && (
            <Button
              variant="secondary"
              onClick={() => onChat(plan.id)}
            >
              Chat
            </Button>
          )}
        </div>
      )}

      {isPast && (
        <p className="text-gray-500 mt-3 font-medium">
          This plan has ended.
        </p>
      )}
    </div>
  );
}
