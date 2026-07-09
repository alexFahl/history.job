const { z } = require("zod");

/**
 * createProfileSchema
 *
 * Validates the request body for POST /api/profiles
 *
 * Rules:
 * - profileName : required, 1 to 60 characters
 * - country     : required, non-empty string
 * - timezone    : required, non-empty string
 */
const createProfileSchema = z.object({
  profileName: z
    .string()
    .min(1, "Profile name is required")
    .max(60, "Profile name cannot exceed 60 characters"),

  country: z.string().min(1, "Country is required"),

  timezone: z.string().min(1, "Timezone is required"),
});

/**
 * updateProfileSchema
 *
 *
 * Allowed updates:
 * - profileName : rename the profile
 * - isActive    : archive (false) or reactivate (true) the profile
 */
const updateProfileSchema = z.object({
  profileName: z
    .string()
    .min(1, "Profile name cannot be empty")
    .max(60, "Profile name cannot exceed 60 characters")
    .optional(),

  isActive: z.boolean().optional(),
});

module.exports = { createProfileSchema, updateProfileSchema };
