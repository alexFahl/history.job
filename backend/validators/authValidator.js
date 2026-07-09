const { z } = require("zod");

/**
 * registerSchema
 *
 * Validates the request body for POST /api/auth/register
 *
 * Rules:
 * - username : 3 to 30 characters, must be a string
 * - password : minimum 6 characters and the controller will hash it with bcrypt
 */
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * loginSchema
 *
 * Validates the request body for POST /api/auth/login.
 *
 * Rules:
 * - username : must be a non-empty string
 * - password : must be a non-empty string
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),

  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
