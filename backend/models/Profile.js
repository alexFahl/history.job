const mongoose = require("mongoose");

/**
 * Profile Schema
 *
 * A Profile represents a job-search context attached to a specific country
 * A user can have multiple profiles
 *
 * Fields:
 * - userId       : Reference to the User who owns this profile
 * - profileName  : A label chosen by the user
 * - country      : The target country for this job search
 * - timezone     : IANA timezone string
 * - isActive     : Soft toggle
 * - createdAt    : Timestamp of profile creation
 */
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  profileName: {
    type: String,
    required: [true, "Profile name is required"],
    trim: true,
    maxlength: [60, "Profile name cannot exceed 60 characters"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
  },
  timezone: {
    type: String,
    required: [true, "Timezone is required"],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
