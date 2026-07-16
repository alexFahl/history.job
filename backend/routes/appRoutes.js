const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/appController");

const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const {
  createApplicationSchema,
  updateApplicationSchema,
  addContactSchema,
  addFollowUpSchema,
  addReplySchema,
} = require("../validators/appValidator");

// POST => Create a new application
router.post("/", protect, validate(createApplicationSchema), createApplication);

// GET => Get all applications for a profile
router.get("/profile/:profileId", protect, getApplicationsByProfile);

// GET => Get one application
router.get("/:id", protect, getApplicationById);

// PUT => Update application fields
router.put(
  "/:id",
  protect,
  validate(updateApplicationSchema),
  updateApplication,
);

// DELETE => delete an application
router.delete("/:id", protect, deleteApplication);

// POST => Add a recruiter contact
router.post("/:id/contacts", protect, validate(addContactSchema), addContact);

// DELETE => Remove a recruiter contact
router.delete("/:id/contacts/:contactId", protect, deleteContact);

// POST => Log a follow-up attempt
router.post(
  "/:id/followups",
  protect,
  validate(addFollowUpSchema),
  addFollowUp,
);

// DELETE => Remove a follow-up entry
router.delete("/:id/followups/:followUpId", protect, deleteFollowUp);

// POST => Log an incoming reply
router.post("/:id/replies", protect, validate(addReplySchema), addReply);

// DELETE => Remove a reply entry
router.delete("/:id/replies/:replyId", protect, deleteReply);

// POST => Upload CV or cover letter to Cloudinary
router.post("/:id/upload", protect, upload.single("file"), uploadDocument);

// DELETE => Remove an uploaded CV or cover letter (and delete it from Cloudinary)
router.delete("/:id/documents/:docType", protect, deleteDocument);

module.exports = router;
