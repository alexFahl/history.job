const { z } = require("zod");

// Upper bound on the job offer text sent to the LLM
// Protects against oversized payloads
const MAX_TEXT_LENGTH = 15000;

/**
 * analyzeJobOfferSchema
 *
 * Validates the request body for POST /api/ai/analyze
 *
 * Rules:
 * - textContent : required, non-empty string, capped at MAX_TEXT_LENGTH characters
 */
const analyzeJobOfferSchema = z.object({
  textContent: z
    .string()
    .trim()
    .min(1, "Text content is required for analysis")
    .max(
      MAX_TEXT_LENGTH,
      `Text content cannot exceed ${MAX_TEXT_LENGTH} characters`,
    ),
});

module.exports = { analyzeJobOfferSchema, MAX_TEXT_LENGTH };
