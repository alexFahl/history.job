import { z } from "zod";

/**
 * profileSchema
 *
 * Front-end validation for the "Add new profile" modal
 * This mirrors the back-end's createProfileSchema (validators/profileValidator.js)
 * so the user gets instant feedback before the request is even sent
 *
 */
export const profileSchema = z.object({
  profileName: z
    .string()
    .min(1, "Profile name is required")
    .max(60, "Profile name cannot exceed 60 characters"),

  country: z.string().min(1, "Please select a country"),

  timezone: z.string().min(1, "Timezone could not be determined"),
});
