const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load .env variables
dotenv.config();

// Fail fast if any required environment variable is missing
const validateEnv = require("./config/validateEnv");
validateEnv();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const appRoutes = require("./routes/appRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// CORS: restricts which origins can call this API.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow the front-end to send cookies
  }),
);

app.use(express.json());

// =============================
// ========== ROUTES ===========
app.get("/api", (req, res) => {
  res.json({ message: "History.job API is running" });
});

// AUTH ROUTE
app.use("/api/auth", authRoutes);

// PROFILE ROUTES
app.use("/api/profiles", profileRoutes);

// APPLICATION ROUTES
app.use("/api/applications", appRoutes);

// GEMINI AI ROUTE
app.use("/api/ai", aiRoutes);

// UNKNOWN ROUTE
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// GLOBAL ERROR ROUTE
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// =============================
// ====== START SERVER =========
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
