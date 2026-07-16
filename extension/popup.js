const API_BASE_URL = "http://localhost:5000/api";

// Helper to get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().slice(0, 10);

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginMessage = document.getElementById("login-message");

  const loginSection = document.getElementById("login-section");
  const appSection = document.getElementById("app-section");
  const userDisplay = document.getElementById("user-display");

  // Form Elements
  const profileSelect = document.getElementById("profile-select");
  const companyInput = document.getElementById("company-name");
  const jobTitleInput = document.getElementById("job-title");
  const locationInput = document.getElementById("location");
  const jobAdUrlInput = document.getElementById("job-ad-url");
  const salaryExpectedInput = document.getElementById("salary-expected");
  const currencyInput = document.getElementById("currency");
  const appliedDateInput = document.getElementById("applied-date");
  const jobTypeSelect = document.getElementById("job-type");
  const statusSelect = document.getElementById("status");

  const analyzeBtn = document.getElementById("analyze-btn");
  const actionMessage = document.getElementById("action-message");
  const pageContentTextarea = document.getElementById("page-content"); // Hidden by default now

  // Check if user is already logged in
  chrome.storage.local.get(["token", "username"], (result) => {
    if (result.token) {
      showApp(result.username, result.token);
    }
  });

  // --- Save selected profile to storage when changed ---
  profileSelect.addEventListener("change", () => {
    chrome.storage.local.set({ selectedProfileId: profileSelect.value });
  });

  // --- Login Action ---
  loginBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      loginMessage.textContent = "Please fill in all fields.";
      return;
    }

    loginBtn.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        chrome.storage.local.set(
          { token: data.token, username: data.user.username },
          () => {
            showApp(data.user.username, data.token);
          },
        );
      } else {
        loginMessage.textContent = data.message || "Login failed.";
      }
    } catch (error) {
      loginMessage.textContent = "Cannot connect to local server.";
    } finally {
      loginBtn.textContent = "Log In";
    }
  });

  // --- Logout Action ---
  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove(
      ["token", "username", "selectedProfileId"],
      () => {
        loginSection.style.display = "block";
        appSection.style.display = "none";
        usernameInput.value = "";
        passwordInput.value = "";
      },
    );
  });

  // --- Show App Interface & Initialize Data ---
  function showApp(username, token) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    userDisplay.textContent = username;

    loadProfiles(token);
    extractJobDetails();
  }

  // --- Fetch Profiles from Backend ---
  async function loadProfiles(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      profileSelect.innerHTML = "";

      if (response.ok && data.profiles && data.profiles.length > 0) {
        data.profiles.forEach((profile) => {
          const option = document.createElement("option");
          option.value = profile._id;
          option.textContent = profile.profileName;
          profileSelect.appendChild(option);
        });

        chrome.storage.local.get(["selectedProfileId"], (result) => {
          if (result.selectedProfileId) {
            const exists = Array.from(profileSelect.options).some(
              (opt) => opt.value === result.selectedProfileId,
            );
            if (exists) {
              profileSelect.value = result.selectedProfileId;
            }
          } else {
            chrome.storage.local.set({
              selectedProfileId: profileSelect.value,
            });
          }
        });
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No profiles found";
        option.disabled = true;
        profileSelect.appendChild(option);
      }
    } catch (error) {
      profileSelect.innerHTML =
        '<option value="" disabled>Error loading profiles</option>';
    }
  }

  // --- Ask content.js to extract basic data & Auto-fill default fields ---
  function extractJobDetails() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) return;

      // Auto-fill defaults
      jobAdUrlInput.value = activeTab.url || "";
      appliedDateInput.value = getToday();
      statusSelect.value = "T"; // "To Apply"

      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "extractJobData" },
        (response) => {
          if (chrome.runtime.lastError) return;

          if (response) {
            companyInput.value = response.companyName || "";
            jobTitleInput.value = response.jobTitle || "";
            // We use the URL returned by the script if available, else fallback to tab url
            if (response.jobAdUrl) jobAdUrlInput.value = response.jobAdUrl;
          }
        },
      );
    });
  }

  // --- Analyze Offer Action (AI Integration) ---
  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.textContent = "Reading page...";
    actionMessage.textContent = "";
    pageContentTextarea.style.display = "block";
    pageContentTextarea.value = "Extracting text...";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        actionMessage.textContent = "Cannot access the active tab.";
        actionMessage.className = "error-msg";
        analyzeBtn.textContent = "Analyze offer";
        return;
      }

      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "analyzeOffer" },
        (response) => {
          if (chrome.runtime.lastError) {
            actionMessage.textContent =
              "Connection error. Please refresh the page.";
            actionMessage.className = "error-msg";
            analyzeBtn.textContent = "Analyze offer";
            return;
          }

          if (response && response.htmlContent) {
            analyzeBtn.textContent = "AI is thinking...";
            pageContentTextarea.value = "Sending to Gemini AI...";

            chrome.storage.local.get(["token"], async (result) => {
              try {
                const aiResponse = await fetch(`${API_BASE_URL}/ai/analyze`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${result.token}`,
                  },
                  body: JSON.stringify({ textContent: response.htmlContent }),
                });

                const data = await aiResponse.json();

                if (aiResponse.ok && data.jobData) {
                  // Populate the UI with AI results
                  companyInput.value =
                    data.jobData.companyName || companyInput.value;
                  jobTitleInput.value =
                    data.jobData.jobTitle || jobTitleInput.value;
                  locationInput.value =
                    data.jobData.location || locationInput.value;
                  salaryExpectedInput.value =
                    data.jobData.salaryExpected || salaryExpectedInput.value;

                  if (data.jobData.currency) {
                    currencyInput.value = data.jobData.currency;
                  }

                  if (data.jobData.jobType) {
                    jobTypeSelect.value = data.jobData.jobType;
                  }

                  pageContentTextarea.value = JSON.stringify(
                    data.jobData,
                    null,
                    2,
                  );
                  pageContentTextarea.style.display = "none"; // Hide debug textarea on success

                  actionMessage.textContent = "AI analysis complete!";
                  actionMessage.className = "success-msg";
                } else {
                  actionMessage.textContent =
                    data.message || "AI Analysis failed.";
                  actionMessage.className = "error-msg";
                }
              } catch (error) {
                actionMessage.textContent =
                  "Server error. Is the backend running?";
                actionMessage.className = "error-msg";
              } finally {
                analyzeBtn.textContent = "Analyze offer";
              }
            });
          } else {
            actionMessage.textContent = "Failed to extract text.";
            actionMessage.className = "error-msg";
            analyzeBtn.textContent = "Analyze offer";
          }
        },
      );
    });
  });
});
