const Profile = require("../models/Profile");
const Application = require("../models/Application");

// SECURITY
// Verifies that a profile exists and belongs to the currently authenticated user
//
// @param {string} profileId - The id from the URL parameter
// @param {string} userId    - The id from req.user
// @returns {object|null}    - The profile document, or null if not found / not owned
const findOwnedProfile = async (profileId, userId) => {
  return await Profile.findOne({ _id: profileId, userId });
};

// @desc    Create a new profile
// @route   POST /api/profiles
// @access  Private
const createProfile = async (req, res) => {
  try {
    const { profileName, country, timezone } = req.body;

    const profile = await Profile.create({
      userId: req.user._id, // Taken from the JWT — the user cannot fake this
      profileName,
      country,
      timezone,
    });

    res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("[ProfileController] createProfile error:", error.message);
    res.status(500).json({ message: "Server error while creating profile" });
  }
};

// @desc    Get all profiles for the logged-in user
// @route   GET /api/profiles
// @access  Private
const getProfiles = async (req, res) => {
  try {
    // a user can only see their own profiles
    const profiles = await Profile.find({ userId: req.user._id }).sort({
      createdAt: 1,
    });

    res.status(200).json({ profiles });
  } catch (error) {
    console.error("[ProfileController] getProfiles error:", error.message);
    res.status(500).json({ message: "Server error while fetching profiles" });
  }
};

// @desc    Get a single profile by ID
// @route   GET /api/profiles/:id
// @access  Private
const getProfileById = async (req, res) => {
  try {
    const profile = await findOwnedProfile(req.params.id, req.user._id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error("[ProfileController] getProfileById error:", error.message);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// @desc    Update a profile (rename or toggle isActive)
// @route   PUT /api/profiles/:id
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const profile = await findOwnedProfile(req.params.id, req.user._id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Only update the fields that were actually sent in the request body
    if (req.body.profileName !== undefined) {
      profile.profileName = req.body.profileName;
    }
    if (req.body.isActive !== undefined) {
      profile.isActive = req.body.isActive;
    }

    const updatedProfile = await profile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("[ProfileController] updateProfile error:", error.message);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

// @desc    Delete a profile (and cascade-delete its applications)
// @route   DELETE /api/profiles/:id
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const profile = await findOwnedProfile(req.params.id, req.user._id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Cascade-delete: remove all applications that belong to this profile
    await Application.deleteMany({ profileId: profile._id });

    await profile.deleteOne();

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("[ProfileController] deleteProfile error:", error.message);
    res.status(500).json({ message: "Server error while deleting profile" });
  }
};

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
