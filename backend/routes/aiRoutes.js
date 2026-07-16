const express = require("express");
const router = express.Router();

const { analyzeJobOffer } = require("../controllers/aiController");
const { protect } = require("../middlewares/auth");

// POST => Analyze job offer text using AI
router.post("/analyze", protect, analyzeJobOffer);

module.exports = router;
