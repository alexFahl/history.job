const API_BASE_URL = "https://history-job.onrender.com/api";
let abortController = null;

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runAIAnalysis") {
    // If analysis is already running, abort it before starting a new one
    if (abortController) abortController.abort();
    abortController = new AbortController();

    chrome.storage.local.set({ aiStatus: "loading", aiError: null });

    fetch(`${API_BASE_URL}/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.token}`,
      },
      body: JSON.stringify({ textContent: request.textContent }),
      signal: abortController.signal, // Attach the signal to the fetch request for cancellation
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.jobData) {
          chrome.storage.local.set({
            aiStatus: "success",
            aiData: data.jobData,
          });
        } else {
          chrome.storage.local.set({
            aiStatus: "error",
            aiError: data.message || "AI Analysis failed.",
          });
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          // Analyze request was aborted by the user
          console.log("AI Analysis aborted by user.");
        } else {
          chrome.storage.local.set({
            aiStatus: "error",
            aiError: "Server error. Please try again later.",
          });
        }
      });

    sendResponse({ received: true });
  } else if (request.action === "cancelAIAnalysis") {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    sendResponse({ cancelled: true });
  }

  return true;
});
