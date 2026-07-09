const { z } = require("zod");

/**
 * createApplicationSchema
 * Validates POST /api/applications
 * Rules:
 * - profileId   : required, must be a valid MongoDB ObjectId string
 * - companyName : required, non-empty string
 * - jobTitle    : required, non-empty string
 * - location    : optional, string
 * - jobType     : optional, one of "C" (Contract), "H" (Hybrid), or "R" (Remote)
 * - salaryExpected : optional, string
 * - currency    : optional, string (default: "€")
 * - jobAdUrl    : optional, string (URL to the original job posting)
 */
const createApplicationSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  location: z.string().optional(),
  jobType: z.enum(["C", "H", "R"]).optional(),
  salaryExpected: z.string().optional(),
  currency: z.string().optional(),
  jobAdUrl: z.string().optional(),
});

/**
 * updateApplicationSchema
 * Validates PUT /api/applications/:id
 * Rules:
 * - companyName : optional, non-empty string
 * - jobTitle    : optional, non-empty string
 * - location    : optional, string
 * - jobType     : optional, one of "C" (Contract), "H" (Hybrid), or "R" (Remote)
 * - salaryExpected : optional, string
 * - currency    : optional, string
 * - jobAdUrl    : optional, string (URL to the original job posting)
 * - status      : optional, one of "T" (To Apply), "A" (Applied), "I" (Interviewing), "R" (Rejected), or "O" (Offer)
 * - appliedDate : optional, date
 * - notes       : optional, string
 */
const updateApplicationSchema = z.object({
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  location: z.string().optional(),
  jobType: z.enum(["C", "H", "R"]).optional(),
  salaryExpected: z.string().optional(),
  currency: z.string().optional(),
  jobAdUrl: z.string().optional(),
  status: z.enum(["T", "A", "I", "R", "O"]).optional(),
  appliedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

/**
 * addContactSchema
 * Validates POST /api/applications/:id/contacts
 * Rules:
 * - name  : required, non-empty string
 * - email : optional, string
 * - phone : optional, string
 * - job   : optional, string
 */
const addContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  job: z.string().optional(),
});

/**
 * addFollowUpSchema
 * Validates POST /api/applications/:id/followups
 * Rules:
 * - date  : required, must be a valid date
 * - note  : optional, string
 * - communicationChannel : optional, one of "M" (Mail), "P" (Phone), "L" (LinkedIn), "I" (In-person), or "S" (SMS)
 */
const addFollowUpSchema = z.object({
  date: z.coerce.date(),
  note: z.string().optional(),
  communicationChannel: z.enum(["M", "P", "L", "I", "S"]).optional(),
});

/**
 * addReplySchema
 * Validates POST /api/applications/:id/replies
 * Rules:
 * - date  : required, must be a valid date
 * - communicationChannel : optional, one of "M" (Mail), "P" (Phone), "L" (LinkedIn), "I" (In-person), or "S" (SMS)
 */
const addReplySchema = z.object({
  date: z.coerce.date(),
  communicationChannel: z.enum(["M", "P", "L", "I", "S"]).optional(),
});

module.exports = {
  createApplicationSchema,
  updateApplicationSchema,
  addContactSchema,
  addFollowUpSchema,
  addReplySchema,
};
