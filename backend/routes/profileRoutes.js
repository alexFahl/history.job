const express = require("express");
const router = express.Router();

const {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createProfileSchema,
  updateProfileSchema,
} = require("../validators/profileValidator");

// POST => Create a new profile
router.post("/", protect, validate(createProfileSchema), createProfile);

// GET => Get all profiles for the logged-in user
router.get("/", protect, getProfiles);

// GET => Get a single profile by ID
router.get("/:id", protect, getProfileById);

// PUT => Update profileName or isActive
router.put("/:id", protect, validate(updateProfileSchema), updateProfile);

// DELETE => Delete a profile
router.delete("/:id", protect, deleteProfile);

module.exports = router;
