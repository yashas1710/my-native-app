// Utility to normalize Firestore Timestamp, Date, string, or seconds/nanoseconds object
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  // Firestore Timestamp has toDate()
  if (typeof value.toDate === "function") return value.toDate();
  // Plain object with seconds/nanoseconds
  if (typeof value.seconds === "number") {
    const ms = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
    return new Date(ms);
  }
  return new Date(value);
}
function formatDate(value) {
  const d = toDate(value);
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default formatDate;
export { formatDate };

