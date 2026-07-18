import { z } from "zod";

/**
 * applicationSchema
 */
export const applicationSchema = z.object({
  profileId: z.string().min(1),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobAdUrl: z.string().optional(),
  jobType: z.enum(["C", "H", "R"]).optional(),
  status: z.enum(["T", "A", "I", "R", "O"]).optional(),
  location: z.string().optional(),
  salaryExpected: z.string().optional(),
  currency: z.string().optional(),
  appliedDate: z.string().optional(),
  description: z.string().optional(),
});
