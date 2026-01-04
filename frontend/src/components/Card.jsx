import { useEffect, useState } from "react";
import Button from "./Button";

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
}) {
  const [countdown, setCountdown] = useState("");

  const startDate = plan.startDate?.toDate?.() ?? (plan.startDate ? new Date(plan.startDate) : null);
  const endDate = plan.endDate?.toDate?.() ?? (plan.endDate ? new Date(plan.endDate) : null);

  useEffect(() => {
    if (!startDate || isPast) return;
    const interval = setInterval(() => {
      const diff = new Date(startDate) - new Date();
      if (diff <= 0) {
        setCountdown(null);
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate, isPast]);

  const borderColor = isPast ? "border-gray-300" : "border-blue-400";

  return (
    <div className={`bg-white rounded shadow-card p-4 mb-4 border-l-4 ${borderColor}`}>
      <h3 className="text-xl font-semibold mb-1">{plan.title}</h3>
      <p className="text-gray-700 mb-2">{plan.description}</p>

      {(startDate || endDate) && (
        <p className="text-gray-500 mb-2">
          <span className="font-medium">{getRelativeLabel(startDate)}</span> •{" "}
          {startDate && endDate
            ? `${startDate.toLocaleString()} → ${endDate.toLocaleString()}`
            : ""}
        </p>
      )}

      {countdown && <p className="text-sm text-green-600 font-medium mb-2">Starts in: {countdown}</p>}

      {plan.createdBy && (
        <p className="text-gray-500 mb-2">
          Created by: <span className="font-medium">{plan.createdBy}</span>
        </p>
      )}

      {!isPast && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {isCreator && (
            <>
              <Button onClick={onEdit}>Edit</Button>
              <Button variant="danger" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}

          {!isCreator && !hasJoined && onJoin && <Button onClick={onJoin}>I’m In</Button>}
          {!isCreator && hasJoined && onLeave && <Button variant="danger" onClick={onLeave}>Leave Plan</Button>}
        </div>
      )}

      {isPast && <p className="text-gray-500 mt-3 font-medium">This plan has ended.</p>}
    </div>
  );
}
