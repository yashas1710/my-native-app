import Button from "./Button";

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
}) {
  const startDate = plan.startDate
    ? new Date(plan.startDate)
    : null;

  const endDate = plan.endDate
    ? new Date(plan.endDate)
    : null;

  return (
    <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold truncate">
          {plan.title}
        </h3>

        <span
          className={`px-2 py-1 text-xs rounded-full ${
            isPast
              ? "bg-gray-200 text-gray-700"
              : "bg-green-200 text-green-800"
          }`}
        >
          {isPast ? "Past Plan" : "Active Plan"}
        </span>
      </div>

      {plan.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {plan.description}
        </p>
      )}

      {(startDate || endDate) && (
        <p className="text-gray-500 mb-3 text-sm">
          <span className="font-medium">
            {getRelativeLabel(startDate)}
          </span>

          {" • "}

          {startDate && endDate
            ? `${formatDate(startDate)} → ${formatDate(endDate)}`
            : formatDate(startDate)}
        </p>
      )}

      <div className="flex items-center gap-2 mb-4">
        {creator?.photoURL ? (
          <img
            src={creator.photoURL}
            alt={creator.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300" />
        )}

        <span className="text-sm text-gray-600 dark:text-gray-300">
          Created by{" "}
          <span className="font-medium">
            {creator?.name}
          </span>
        </span>
      </div>

      <div className="flex gap-2 flex-wrap mt-4">
        {isCreator && (
          <>
            <Button onClick={onEdit}>
              Edit
            </Button>

            <Button
              variant="danger"
              onClick={onDelete}
            >
              Delete
            </Button>
          </>
        )}

        {!isCreator && !hasJoined && (
          <Button onClick={onJoin}>
            I’m In
          </Button>
        )}

        {!isCreator && hasJoined && (
          <Button
            variant="danger"
            onClick={onLeave}
          >
            Leave Plan
          </Button>
        )}
      </div>

      {isPast && (
        <p className="text-gray-500 mt-3 text-sm italic">
          This plan has ended.
        </p>
      )}
    </div>
  );
}