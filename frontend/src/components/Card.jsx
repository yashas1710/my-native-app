import { useNavigate } from "react-router-dom";

const formatTime = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const planDay = new Date(date);
  planDay.setHours(0, 0, 0, 0);

  if (planDay.getTime() === today.getTime()) {
    return { label: "Today", style: "today" };
  }

  if (planDay.getTime() === tomorrow.getTime()) {
    return { label: "Tomorrow", style: "tomorrow" };
  }

  return {
    label: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    style: "future",
  };
};

const getCreatorInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";

  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";

  return `${first}${last}`.toUpperCase() || "?";
};

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
    <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
    <path d="M8 14s4-3.5 4-7a4 4 0 10-8 0c0 3.5 4 7 4 7z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <circle cx="8" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.25" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
    <path d="M11.5 13.25v-1a3 3 0 00-3-3h-1a3 3 0 00-3 3v1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="7.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.25" />
    <path d="M13.5 13.25v-.75a2.5 2.5 0 00-2-2.45" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M10.5 4.75a2 2 0 010 3.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

export default function Card({
  plan,
  creator,
  isCreator = false,
  hasJoined = false,
  isPast = false,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const startTime = formatTime(plan?.startDate);
  const dateLabel = plan?.startDate ? getDateLabel(plan.startDate) : null;
  const creatorName = creator?.name || "Unknown";
  const creatorInitials = getCreatorInitials(creatorName);
  const participantCount = plan?.participantCount ?? plan?.participants?.length;

  const handleCardClick = () => {
    if (plan?.id) {
      navigate(`/plan/${plan.id}`);
    }
  };

  const stopAndRun = (handler) => (event) => {
    event.stopPropagation();
    if (handler) handler(event);
  };

  const badgeStyle = (() => {
    if (!dateLabel) return {};

    if (!isPast && dateLabel.style === "today") {
      return {
        backgroundColor: "#ECFDF5",
        color: "#065F46",
        border: "0.5px solid #A7F3D0",
      };
    }

    if (!isPast && dateLabel.style === "tomorrow") {
      return {
        backgroundColor: "#EEF2FF",
        color: "#3730A3",
        border: "0.5px solid #C7D2FE",
      };
    }

    return {
      backgroundColor: "var(--surface-2)",
      color: "var(--text-2)",
      border: "0.5px solid var(--border)",
    };
  })();

  return (
    <article
      className="bg-[var(--surface)] rounded-[var(--radius-md)] p-4"
      style={{ border: "0.5px solid var(--border)" }}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[15px] font-semibold tracking-[-0.2px] leading-5"
            style={{ color: "var(--text-1)" }}
          >
            {plan.title}
          </h3>

          {dateLabel && (
            <span
              className="shrink-0 rounded-full px-2 py-[3px] text-[11px] font-medium"
              style={badgeStyle}
            >
              {dateLabel.label}
            </span>
          )}
        </div>

        {plan.description && (
          <p
            className="mt-2 overflow-hidden text-[13px] leading-5"
            style={{
              color: "var(--text-2)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {plan.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-[12px]" style={{ color: "var(--text-3)" }}>
          {startTime && (
            <div className="flex items-center gap-1.5">
              <ClockIcon />
              <span>{startTime}</span>
            </div>
          )}

          {plan.location && (
            <div className="flex items-center gap-1.5">
              <PinIcon />
              <span>{plan.location}</span>
            </div>
          )}

          {plan.maxSpots ? (
            <div className="flex items-center gap-1.5">
              <UsersIcon />
              <span>
                {participantCount !== undefined
                  ? `${Math.max(0, plan.maxSpots - participantCount)} spots left`
                  : `${plan.maxSpots} spots`}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-3 pt-3"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
            aria-hidden="true"
          >
            {creatorInitials}
          </span>
          <span className="truncate text-[12px]" style={{ color: "var(--text-2)" }}>
            by <span style={{ color: "var(--text-1)" }}>{creatorName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPast ? null : isCreator ? (
            <>
              <button
                type="button"
                onClick={stopAndRun(onEdit)}
                className="rounded-[7px] px-[10px] py-[5px] text-[12px] font-normal"
                style={{
                  backgroundColor: "transparent",
                  border: "0.5px solid var(--border-md)",
                  color: "var(--text-2)",
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={stopAndRun(onDelete)}
                className="rounded-[7px] px-[10px] py-[5px] text-[12px] font-normal"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "0.5px solid #FCA5A5",
                  color: "#DC2626",
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={stopAndRun(hasJoined ? onLeave : onJoin)}
              className="rounded-[7px] px-[12px] py-[5px] text-[12px] font-medium text-white"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {hasJoined ? "You’re in ✓" : "I’m in"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}