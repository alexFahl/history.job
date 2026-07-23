const API_BASE_URL = "http://localhost:5000/api";

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

  const profileSelect = document.getElementById("profile-select");
  const analyzeBtn = document.getElementById("analyze-btn");
  const actionMessage = document.getElementById("action-message");

  const addOfferBtn = document.getElementById("add-offer-btn");
  const cancelOfferBtn = document.getElementById("cancel-offer-btn");
  const saveMessage = document.getElementById("save-message");

  const formFields = document.getElementById("form-fields");
  const loader = document.getElementById("loader");
  const cancelAnalysisBtn = document.getElementById("cancel-analysis-btn");

  const formInputs = {
    companyName: document.getElementById("company-name"),
    jobTitle: document.getElementById("job-title"),
    location: document.getElementById("location"),
    jobAdUrl: document.getElementById("job-ad-url"),
    salaryExpected: document.getElementById("salary-expected"),
    currency: document.getElementById("currency"),
    appliedDate: document.getElementById("applied-date"),
    jobType: document.getElementById("job-type"),
    status: document.getElementById("status"),
    description: document.getElementById("description"),
  };

  // STATE MANAGEMENT
  function saveFormState() {
    const formData = {};
    for (const key in formInputs) {
      formData[key] = formInputs[key].value;
    }
    chrome.storage.local.set({ formData });
  }

  // Save form state on input or change events in real time
  for (const key in formInputs) {
    formInputs[key].addEventListener("input", saveFormState);
    formInputs[key].addEventListener("change", saveFormState);
  }

  chrome.storage.local.get(["token", "username"], (result) => {
    if (result.token) {
      showApp(result.username, result.token);
    }
  });

  profileSelect.addEventListener("change", () => {
    chrome.storage.local.set({ selectedProfileId: profileSelect.value });
  });

  // AUTHENTICATION
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
          () => showApp(data.user.username, data.token),
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

  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      loginSection.style.display = "block";
      appSection.style.display = "none";
      usernameInput.value = "";
      passwordInput.value = "";
      formFields.style.display = "none";
      loader.style.display = "none";
      actionMessage.textContent = "";
    });
  });

  function showApp(username, token) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    userDisplay.textContent = username;

    loadProfiles(token);
    initializeState();
  }

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
            profileSelect.value = result.selectedProfileId;
          } else {
            chrome.storage.local.set({
              selectedProfileId: profileSelect.value,
            });
          }
        });
      } else {
        profileSelect.innerHTML =
          '<option value="" disabled>No profiles found</option>';
      }
    } catch (error) {
      profileSelect.innerHTML =
        '<option value="" disabled>Error loading profiles</option>';
    }
  }

  // SMART STATE INITIALIZATION
  function initializeState() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      chrome.storage.local.get(
        ["formData", "aiStatus", "aiData", "aiError"],
        (result) => {
          let hasState = false;

          // 1. restore form state if it exists in storage
          if (result.formData) {
            restoreFormState(result.formData);

            // If the user hasn't launched AI yet, we keep the form hidden but the data is safely pre-filled in the background
            if (result.aiStatus === "idle" && result.aiData) {
              showFormUI();
            }
            hasState = true;
          }

          // 2. handle AI status (loading, success, error)
          if (result.aiStatus === "loading") {
            showLoaderUI();
            hasState = true;
          } else if (result.aiStatus === "success" && result.aiData) {
            applyAiData(result.aiData);
            chrome.storage.local.set({ aiStatus: "idle" });
            hasState = true;
          } else if (result.aiStatus === "error") {
            showErrorUI(result.aiError);
            chrome.storage.local.set({ aiStatus: "idle" });
            hasState = true;
          }

          // 3. if everything is empty, extract the current title and URL
          if (!hasState && activeTab) {
            extractJobDetailsSilent(activeTab);
          }
        },
      );
    });
  }

  // Extraction without showing the form (prepares the fields in the background)
  function extractJobDetailsSilent(activeTab) {
    formInputs.jobAdUrl.value = activeTab.url || "";
    formInputs.appliedDate.value = getToday();
    formInputs.status.value = "A";

    // IMPORTANT: Save immediately so URL and Date aren't lost if closed early
    saveFormState();

    chrome.tabs.sendMessage(
      activeTab.id,
      { action: "extractJobData" },
      (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
          formInputs.companyName.value = response.companyName || "";
          formInputs.jobTitle.value = response.jobTitle || "";
          if (response.jobAdUrl) formInputs.jobAdUrl.value = response.jobAdUrl;

          // IMPORTANT: Save again after receiving content.js data
          saveFormState();
        }
      },
    );
  }

  function restoreFormState(data) {
    for (const key in formInputs) {
      if (data[key] !== undefined) formInputs[key].value = data[key];
    }
  }

  // REAL-TIME BACKGROUND LISTENER
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.aiStatus) {
      const newStatus = changes.aiStatus.newValue;

      if (newStatus === "success") {
        chrome.storage.local.get(["aiData"], (res) => {
          applyAiData(res.aiData);
          chrome.storage.local.set({ aiStatus: "idle" });
        });
      } else if (newStatus === "error") {
        chrome.storage.local.get(["aiError"], (res) => {
          showErrorUI(res.aiError);
          chrome.storage.local.set({ aiStatus: "idle" });
        });
      }
    }
  });

  function applyAiData(data) {
    formInputs.companyName.value =
      data.companyName || formInputs.companyName.value;
    formInputs.jobTitle.value = data.jobTitle || formInputs.jobTitle.value;
    formInputs.location.value = data.location || formInputs.location.value;
    formInputs.salaryExpected.value =
      data.salaryExpected || formInputs.salaryExpected.value;
    formInputs.description.value =
      data.description || formInputs.description.value;

    if (data.currency) formInputs.currency.value = data.currency;
    if (data.jobType) formInputs.jobType.value = data.jobType;

    saveFormState();
    actionMessage.textContent = "AI analysis complete!";
    actionMessage.className = "success-msg";
    showFormUI();
  }

  // UI HELPERS
  function showLoaderUI() {
    formFields.style.display = "none";
    loader.style.display = "block";
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "AI is thinking...";
    actionMessage.textContent = "";
    saveMessage.textContent = "";
  }

  function showFormUI() {
    loader.style.display = "none";
    formFields.style.display = "block";
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze offer";
    addOfferBtn.disabled = false;
  }

  function showErrorUI(errorMsg) {
    loader.style.display = "none";
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze offer";
    actionMessage.textContent = errorMsg;
    actionMessage.className = "error-msg";

    chrome.storage.local.get(["formData"], (res) => {
      if (res.formData) showFormUI();
    });
  }

  // Central function to hide fields and clear cache
  function resetToPreAnalysisState(showSuccessMessage = false) {
    chrome.storage.local.remove(
      ["formData", "aiStatus", "aiData", "aiError"],
      () => {
        formFields.style.display = "none";
        loader.style.display = "none";

        if (showSuccessMessage) {
          actionMessage.textContent = "Offer successfully saved! ✓";
          actionMessage.className = "success-msg";
        } else {
          actionMessage.textContent = "";
        }

        saveMessage.textContent = "";
        analyzeBtn.textContent = "Analyze offer";
        analyzeBtn.disabled = false;

        // Clear the fields
        for (const key in formInputs) {
          formInputs[key].value = "";
        }

        // Silently reload basic info for the next click
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) extractJobDetailsSilent(tabs[0]);
        });
      },
    );
  }

  // --- ACTIONS ---

  // 1. Analyze Button
  analyzeBtn.addEventListener("click", () => {
    showLoaderUI();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        showErrorUI("Cannot access the active tab.");
        return;
      }

      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "analyzeOffer" },
        (response) => {
          if (chrome.runtime.lastError || !response || !response.htmlContent) {
            showErrorUI("Failed to extract text from page.");
            return;
          }

          chrome.storage.local.get(["token"], (result) => {
            chrome.runtime.sendMessage({
              action: "runAIAnalysis",
              token: result.token,
              textContent: response.htmlContent,
            });
          });
        },
      );
    });
  });

  // 2. Cancel Button
  cancelOfferBtn.addEventListener("click", () => {
    resetToPreAnalysisState(false);
  });

  // 3. Add Offer Button
  addOfferBtn.addEventListener("click", () => {
    if (
      !profileSelect.value ||
      !formInputs.companyName.value.trim() ||
      !formInputs.jobTitle.value.trim()
    ) {
      saveMessage.textContent = "Company Name and Job Title are required.";
      saveMessage.className = "error-msg";
      return;
    }

    addOfferBtn.textContent = "Adding...";
    addOfferBtn.disabled = true;
    saveMessage.textContent = "";

    const payload = {
      profileId: profileSelect.value,
      companyName: formInputs.companyName.value.trim(),
      jobTitle: formInputs.jobTitle.value.trim(),
      location: formInputs.location.value.trim() || undefined,
      jobAdUrl: formInputs.jobAdUrl.value.trim() || undefined,
      salaryExpected: formInputs.salaryExpected.value.trim() || undefined,
      currency: formInputs.currency.value.trim() || undefined,
      appliedDate: formInputs.appliedDate.value || undefined,
      jobType: formInputs.jobType.value || undefined,
      status: formInputs.status.value || "T",
      description: formInputs.description.value.trim() || undefined,
    };

    chrome.storage.local.get(["token"], async (result) => {
      try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${result.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          resetToPreAnalysisState(true);
        } else {
          const errorData = await response.json();
          saveMessage.textContent =
            errorData.message || "Failed to save offer.";
          saveMessage.className = "error-msg";
          addOfferBtn.textContent = "Add offer";
          addOfferBtn.disabled = false;
        }
      } catch (error) {
        saveMessage.textContent = "Server error. Could not save.";
        saveMessage.className = "error-msg";
        addOfferBtn.textContent = "Add offer";
        addOfferBtn.disabled = false;
      }
    });
  });

  // 4. Cancel Analysis Button
  cancelAnalysisBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "cancelAIAnalysis" });
    resetToPreAnalysisState(false);
  });
});
