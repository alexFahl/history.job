const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Number of bycript salt rounds
const SALT_ROUNDS = 10;

/**
 * generateToken
 *
 * Creates a signed JWT to prove a user's identity
 *
 * @param {string} userId - id of the user
 * @returns {string} - JWT string
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user account
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const normalizedUsername = username.trim().toLowerCase();

    // Check if this username is already registered
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This username is already taken" });
    }

    // Hash the password with bcrypt before saving to the database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user
    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
    });

    // Generate a JWT
    const token = generateToken(user._id);

    // Handle the response
    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[AuthController] register error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.trim().toLowerCase();

    // Find the user by username
    const user = await User.findOne({ username: normalizedUsername });

    // compare passwords
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    // if wrong credentials
    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // handle the response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("[AuthController] login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get the currently authenticated user's info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
    },
  });
};

module.exports = { register, login, getMe };
