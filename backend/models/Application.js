const mongoose = require("mongoose");

/**
 * Application Schema
 *
 * Each Application represents one job offer
 *
 * Enum codes are single uppercase letters to keep the database lean:
 *   Status          : T=To Apply, A=Applied, I=Interviewing, R=Rejected, O=Offer
 *   Job Type        : C=City, H=Hybrid, R=Remote
 *   Channel         : M=Mail, P=Phone, L=LinkedIn, I=Intern site, S=Seek.co
 */

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Contact name is required"],
    trim: true,
  },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  job: { type: String, trim: true },
});

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: [true, "Follow-up date is required"] },
  note: { type: String, trim: true },
  communicationChannel: {
    type: String,
    enum: {
      values: ["M", "P", "L", "I", "S"],
      message: "Invalid communication channel",
    },
  },
});

const replySchema = new mongoose.Schema({
  date: { type: Date, required: [true, "Reply date is required"] },
  communicationChannel: {
    type: String,
    enum: {
      values: ["M", "P", "L", "I", "S"],
      message: "Invalid communication channel",
    },
  },
});

const applicationSchema = new mongoose.Schema(
  {
    // Link to the parent Profile
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Profile ID is required"],
    },

    // Informations about the job offer
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    location: { type: String, trim: true },
    jobType: {
      type: String,
      enum: { values: ["C", "H", "R"], message: "Invalid job type" },
    },
    salaryExpected: { type: String, trim: true },
    currency: { type: String, default: "€" },
    jobAdUrl: { type: String, trim: true },

    contacts: [contactSchema],

    status: {
      type: String,
      enum: { values: ["T", "A", "I", "R", "O"], message: "Invalid status" },
      default: "T", // Default: "To Apply"
    },

    appliedDate: { type: Date },
    followUps: [followUpSchema],
    replies: [replySchema],

    notes: { type: String },

    // Documents (Cloudinary URLs)
    documents: {
      cvUrl: { type: String },
      coverLetterUrl: { type: String },
    },
  },
  {
    // timestamps automatically manages createdAt and updatedAt
    timestamps: true,
  },
);

module.exports = mongoose.model("Application", applicationSchema);
