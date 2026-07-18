const Groq = require("groq-sdk");

// Initialize the Groq client with the API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @desc    Analyze job offer text using Groq (Llama 3) and return structured JSON
// @route   POST /api/ai/analyze
// @access  Private
const analyzeJobOffer = async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent) {
      return res
        .status(400)
        .json({ message: "Text content is required for analysis." });
    }

    const prompt = `
      Analyze the following job offer text and extract the key information.
      Return ONLY a valid JSON object strictly using the following keys. If a piece of information is missing, use an empty string "" (or null for enums).
      Expect text in any language, and adapt to extract the information in the language of the offer.

      - "companyName": The name of the company hiring.
      - "jobTitle": The exact job title.
      - "location": The complete address including city, region, and country of the job.
      - "salaryExpected": The salary range or exact salary mentioned (e.g., "30000 - 34000" or "30K - 34K"), and EXLUDE the currency symbol.
      - "currency": The currency symbol mentioned (e.g., "€", "$", "£"). Default to "€" if not specified.
      - "jobType": Must be strictly one of these three uppercase letters based on the text context: 
          "C" (City/On-site: the job is fully at the office), 
          "H" (Hybrid: mixed remote and on-site), 
          "R" (Remote: 100% teleworking). 
          If you cannot determine the job type, return null.
      - "description": Extract a clean, well-formatted summary of the job description, including the main responsibilities and required skills. Use plain text. Moreover, add at the end the skills and requirements, like "Skills: ...; Requirements: ...". 

      Do not invent information. If it's not in the text, leave it empty.

      Job offer text to analyze:
      ${textContent}
    `;

    // Call the Groq API using Llama 3 with JSON mode enabled
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR data extraction API. You strictly output valid JSON objects and absolutely nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // AI used
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    const jobData = JSON.parse(responseText);

    res.status(200).json({
      message: "Analysis successful",
      jobData,
    });
  } catch (error) {
    console.error("[AIController] analyzeJobOffer error:", error.message);
    res.status(500).json({ message: "Server error during AI analysis" });
  }
};

module.exports = { analyzeJobOffer };
