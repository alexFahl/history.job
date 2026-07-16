const path = require("path");
const Application = require("../models/Application");
const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");

// SECURITY HELPER
//
// Ensures an application exists and belongs to the current user.
//
// @param {string} applicationId - The id from the URL parameter
// @param {string} userId        - The id from req.user
// @returns {object|null} The application document, or null if not found / not owned.
// ─────────────────────────────────────────────────────────────────────────────
const findOwnedApplication = async (applicationId, userId) => {
  const application = await Application.findById(applicationId);
  if (!application) return null;

  // Verify the application's parent profile is owned by this user
  const profile = await Profile.findOne({
    _id: application.profileId,
    userId,
  });

  return profile ? application : null;
};

// SHARED HELPER
//
// Removes any uploaded CV / cover letter belonging to an application from Cloudinary storage
//
// @param {object} application - A Mongoose Application document
const deleteApplicationDocuments = async (application) => {
  const { cvPublicId, coverLetterPublicId } = application.documents || {};

  const destroys = [];
  if (cvPublicId) {
    destroys.push(
      cloudinary.uploader.destroy(cvPublicId, { resource_type: "raw" }),
    );
  }
  if (coverLetterPublicId) {
    destroys.push(
      cloudinary.uploader.destroy(coverLetterPublicId, {
        resource_type: "raw",
      }),
    );
  }

  await Promise.all(destroys);
};

// @desc    Create a new job application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  try {
    const { profileId, ...rest } = req.body;

    const profile = await Profile.findOne({
      _id: profileId,
      userId: req.user._id,
    });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const application = await Application.create({ profileId, ...rest });

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error("[AppController] createApplication error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while creating application" });
  }
};

// @desc    Get all applications for a given profile
// @route   GET /api/applications/profile/:profileId
// @access  Private
const getApplicationsByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await Profile.findOne({
      _id: profileId,
      userId: req.user._id,
    });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const applications = await Application.find({ profileId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ applications });
  } catch (error) {
    console.error(
      "[AppController] getApplicationsByProfile error:",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Server error while fetching applications" });
  }
};

// @desc    Get a single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ application });
  } catch (error) {
    console.error("[AppController] getApplicationById error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching application" });
  }
};

// @desc    Update an application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Apply only the fields that were sent
    const updatableFields = [
      "companyName",
      "jobTitle",
      "location",
      "jobType",
      "salaryExpected",
      "currency",
      "jobAdUrl",
      "status",
      "appliedDate",
      "notes",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    // updates the timestamps.updatedAt field
    const updated = await application.save();

    res.status(200).json({
      message: "Application updated successfully",
      application: updated,
    });
  } catch (error) {
    console.error("[AppController] updateApplication error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while updating application" });
  }
};

// @desc    Delete an application permanently
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Remove any uploaded documents from Cloudinary before deleting the record
    await deleteApplicationDocuments(application);

    await application.deleteOne();

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("[AppController] deleteApplication error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while deleting application" });
  }
};

// @desc    Add a contact to an application
// @route   POST /api/applications/:id/contacts
// @access  Private
const addContact = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    // Push a new contact sub-document into the contacts array
    application.contacts.push(req.body);
    await application.save();

    res.status(201).json({
      message: "Contact added",
      contacts: application.contacts,
    });
  } catch (error) {
    console.error("[AppController] addContact error:", error.message);
    res.status(500).json({ message: "Server error while adding contact" });
  }
};

// @desc    Delete a contact from an application
// @route   DELETE /api/applications/:id/contacts/:contactId
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const contact = application.contacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Removes the matching sub-document from the array by its _id
    application.contacts.pull({ _id: req.params.contactId });
    await application.save();

    res.status(200).json({
      message: "Contact deleted",
      contacts: application.contacts,
    });
  } catch (error) {
    console.error("[AppController] deleteContact error:", error.message);
    res.status(500).json({ message: "Server error while deleting contact" });
  }
};

// @desc    Add a follow-up entry to the timeline
// @route   POST /api/applications/:id/followups
// @access  Private
const addFollowUp = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.followUps.push(req.body);
    await application.save();

    res.status(201).json({
      message: "Follow-up added",
      followUps: application.followUps,
    });
  } catch (error) {
    console.error("[AppController] addFollowUp error:", error.message);
    res.status(500).json({ message: "Server error while adding follow-up" });
  }
};

// @desc    Delete a follow-up entry from the timeline
// @route   DELETE /api/applications/:id/followups/:followUpId
// @access  Private
const deleteFollowUp = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const followUp = application.followUps.id(req.params.followUpId);
    if (!followUp) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    application.followUps.pull({ _id: req.params.followUpId });
    await application.save();

    res.status(200).json({
      message: "Follow-up deleted",
      followUps: application.followUps,
    });
  } catch (error) {
    console.error("[AppController] deleteFollowUp error:", error.message);
    res.status(500).json({ message: "Server error while deleting follow-up" });
  }
};

// @desc    Add a reply entry to the timeline
// @route   POST /api/applications/:id/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.replies.push(req.body);
    await application.save();

    res.status(201).json({
      message: "Reply added",
      replies: application.replies,
    });
  } catch (error) {
    console.error("[AppController] addReply error:", error.message);
    res.status(500).json({ message: "Server error while adding reply" });
  }
};

// @desc    Delete a reply entry from the timeline
// @route   DELETE /api/applications/:id/replies/:replyId
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const reply = application.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    application.replies.pull({ _id: req.params.replyId });
    await application.save();

    res.status(200).json({
      message: "Reply deleted",
      replies: application.replies,
    });
  } catch (error) {
    console.error("[AppController] deleteReply error:", error.message);
    res.status(500).json({ message: "Server error while deleting reply" });
  }
};

// @desc    Upload a CV or cover letter to Cloudinary
// @route   POST /api/applications/:id/upload
// @access  Private
//
// Expects multipart/form-data with:
//   - file    : The PDF/Word document
//   - docType : "cv" or "coverLetter"
const uploadDocument = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { docType } = req.body;
    if (!["cv", "coverLetter"].includes(docType)) {
      return res
        .status(400)
        .json({ message: 'docType must be "cv" or "coverLetter"' });
    }

    // Convert to a base64 data URI for the Cloudinary SDK
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Which document slot are we filling in? (cvUrl/cvPublicId or coverLetterUrl/coverLetterPublicId)
    const urlField = docType === "cv" ? "cvUrl" : "coverLetterUrl";
    const publicIdField =
      docType === "cv" ? "cvPublicId" : "coverLetterPublicId";

    // Preserve the original file extension (ex : ".pdf", ".docx")
    const fileExtension = path.extname(req.file.originalname); // ex: ".pdf"
    const publicId = `history-job/documents/${req.user._id}-${req.params.id}-${docType}-${Date.now()}${fileExtension}`;

    // If a document already exists in this slot, delete the old Cloudinary file first
    const previousPublicId = application.documents[publicIdField];
    if (previousPublicId) {
      await cloudinary.uploader.destroy(previousPublicId, {
        resource_type: "raw",
      });
    }

    // Upload to Cloudinary "raw" is required for non-image files like ours
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      public_id: publicId,
      use_filename: false,
    });

    // Save the returned Cloudinary URL AND its public_id
    application.documents[urlField] = result.secure_url;
    application.documents[publicIdField] = result.public_id;
    await application.save();

    res.status(200).json({
      message: "Document uploaded successfully",
      url: result.secure_url,
      docType,
    });
  } catch (error) {
    console.error("[AppController] uploadDocument error:", error.message);
    res.status(500).json({ message: "Server error while uploading document" });
  }
};

// @desc    Delete an uploaded CV or cover letter (removes it from Cloudinary too)
// @route   DELETE /api/applications/:id/documents/:docType
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const application = await findOwnedApplication(req.params.id, req.user._id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const { docType } = req.params;
    if (!["cv", "coverLetter"].includes(docType)) {
      return res
        .status(400)
        .json({ message: 'docType must be "cv" or "coverLetter"' });
    }

    const urlField = docType === "cv" ? "cvUrl" : "coverLetterUrl";
    const publicIdField =
      docType === "cv" ? "cvPublicId" : "coverLetterPublicId";
    const publicId = application.documents[publicIdField];

    if (!publicId) {
      return res
        .status(404)
        .json({ message: "No document to delete for this slot" });
    }

    // Remove the file from Cloudinary storage
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Clear both fields in the database
    application.documents[urlField] = undefined;
    application.documents[publicIdField] = undefined;
    await application.save();

    res.status(200).json({
      message: "Document deleted successfully",
      docType,
    });
  } catch (error) {
    console.error("[AppController] deleteDocument error:", error.message);
    res.status(500).json({ message: "Server error while deleting document" });
  }
};

module.exports = {
  createApplication,
  getApplicationsByProfile,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addContact,
  deleteContact,
  addFollowUp,
  deleteFollowUp,
  addReply,
  deleteReply,
  uploadDocument,
  deleteDocument,
  deleteApplicationDocuments,
};
