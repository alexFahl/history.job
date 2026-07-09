const express = require("express");
const router = express.Router();

const {
  createApplication,
  getApplicationsByProfile,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addContact,
  addFollowUp,
  addReply,
  uploadDocument,
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

// POST => Log a follow-up attempt
router.post(
  "/:id/followups",
  protect,
  validate(addFollowUpSchema),
  addFollowUp,
);

// POST => Log an incoming reply
router.post("/:id/replies", protect, validate(addReplySchema), addReply);

// POST => Upload CV or cover letter to Cloudinary
router.post("/:id/upload", protect, upload.single("file"), uploadDocument);

module.exports = router;
