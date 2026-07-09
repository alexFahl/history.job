/**
 * formatDate
 * Formats a date string or Date object into a human-readable English string
 *
 * @param {string|Date} date - The date to format
 * @param {object} options   - Optional Intl.DateTimeFormat options override
 * @returns {string}         - the date formatted
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
};

/**
 * formatDateTime
 * Same as formatDate but includes the time
 *
 * @param {string|Date} date
 * @returns {string} - the date and time formatted
 */
export const formatDateTime = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/**
 * timeAgo
 * Returns a relative time string
 *
 * @param {string|Date} date
 * @returns {string} - relative time string
 */
export const timeAgo = (date) => {
  if (!date) return "—";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = new Date(date) - new Date();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(days) >= 1) return rtf.format(days, "day");
  if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
  return rtf.format(minutes, "minute");
};
