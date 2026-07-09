const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/authValidator");

// POST => Create a new account
router.post("/register", validate(registerSchema), register);

// POST => Log in to an existing account
router.post("/login", validate(loginSchema), login);

// GET => Get the currently authenticated user's info
router.get("/me", protect, getMe);

module.exports = router;
