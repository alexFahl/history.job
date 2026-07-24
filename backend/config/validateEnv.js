/**
 * validateEnv
 *
 * Fail-fast check of required environment variables at startup
 * If any are missing, the process exits immediately with a clear message
 */

// Variables the app cannot run without
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GROQ_API_KEY",
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name] || process.env[name].trim() === "",
  );

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
    console.error("   Check your .env file before starting the server.");
    process.exit(1);
  }
};

module.exports = validateEnv;
