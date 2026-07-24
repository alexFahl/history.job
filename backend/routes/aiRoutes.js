const express = require("express");
const router = express.Router();

const { analyzeJobOffer } = require("../controllers/aiController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { analyzeJobOfferSchema } = require("../validators/aiValidator");

// POST => Analyze job offer text using AI
router.post(
  "/analyze",
  protect,
  validate(analyzeJobOfferSchema),
  analyzeJobOffer,
);

module.exports = router;
