const mongoose = require("mongoose");

/**
 * User Schema
 *
 * Fields:
 * - username : The unique identifier used to log in
 * - password : stored as a bcrypt hash
 * - createdAt : Timestamp of account creation
 * - lastLogin  : Updated every time the user successfully logs in
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username cannot exceed 30 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
