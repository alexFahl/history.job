chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobData") {
    const jobData = extractDataBasedOnHost(window.location.hostname);
    sendResponse(jobData);
  } else if (request.action === "analyzeOffer") {
    // We now extract clean text instead of raw HTML
    const cleanContent = extractCleanText();
    sendResponse({ htmlContent: cleanContent });
    // Keeping the variable name 'htmlContent' in the response so we don't break popup.js
  }
  return true;
});

function extractDataBasedOnHost(hostname) {
  let companyName = "";
  let jobTitle = "";
  const jobAdUrl = window.location.href;

  try {
    if (hostname.includes("linkedin.com")) {
      jobTitle =
        document
          .querySelector(
            ".jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title",
          )
          ?.innerText?.trim() || "";
      companyName =
        document
          .querySelector(
            ".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name",
          )
          ?.innerText?.trim() || "";
    } else if (hostname.includes("indeed.com")) {
      jobTitle =
        document
          .querySelector(".jobsearch-JobInfoHeader-title span")
          ?.innerText?.trim() || "";
      companyName =
        document
          .querySelector('[data-company-name="true"]')
          ?.innerText?.trim() || "";
    } else {
      jobTitle = document.title;
    }
  } catch (error) {
    console.error("History.job: Error extracting data", error);
  }

  return { companyName, jobTitle, jobAdUrl };
}

/**
 * Extracts only the relevant, visible text from the page for the AI to analyze,
 * stripping out noisy elements like scripts, styles, navbars, and SVGs.
 */
function extractCleanText() {
  // 1. Create a clone of the body so we don't modify the user's actual webpage
  const clonedBody = document.body.cloneNode(true);

  // 2. List of HTML tags and common class names that contain useless noise for the AI
  const selectorsToRemove = [
    "script",
    "style",
    "noscript",
    "svg",
    "img",
    "video",
    "audio",
    "iframe",
    "nav",
    "footer",
    "header",
    '[role="navigation"]',
    "#global-nav", // LinkedIn specific navbar
  ];

  // 3. Remove these elements from our clone
  selectorsToRemove.forEach((selector) => {
    const elements = clonedBody.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  });

  // 4. Extract pure text and clean up excessive empty lines
  let cleanText = clonedBody.innerText || "";
  cleanText = cleanText.replace(/\n\s*\n/g, "\n\n").trim();

  return cleanText;
}
