// src/utils/validatePlanDates.js
export const validatePlanDates = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start < now) {
    return { valid: false, message: "Start date/time cannot be in the past ❌" };
  }

  if (end < start) {
    return { valid: false, message: "End date/time must be after start date ❌" };
  }

  return { valid: true, message: "Dates are valid ✅" };
};
