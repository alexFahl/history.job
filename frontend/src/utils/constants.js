/**
 * Central place for the enum codes used across the Application model
 */

// Application status
export const STATUS_LABELS = {
  T: "To Apply",
  A: "Applied",
  I: "Interviewing",
  R: "Rejected",
  O: "Offer",
};

// Ordered list
export const STATUS_ORDER = ["T", "A", "I", "R", "O"];

// Tailwind colour classes per status, used for badges and column headers
export const STATUS_COLORS = {
  T: "bg-secondary/20 text-secondary",
  A: "bg-primary/20 text-primary",
  I: "bg-warning/20 text-warning",
  R: "bg-danger/20 text-danger",
  O: "bg-success/20 text-success",
};

// Job type
export const JOB_TYPE_LABELS = {
  C: "City",
  H: "Hybrid",
  R: "Remote",
};

// Communication channel
export const CHANNEL_LABELS = {
  M: "Mail",
  P: "Phone",
  L: "LinkedIn",
  I: "Internal site",
  S: "Seek.co",
};
