document.addEventListener("DOMContentLoaded", async () => {
  const jobTitleEl = document.getElementById("jobTitle");
  const companyEl = document.getElementById("company");
  const jobUrlEl = document.getElementById("jobUrl");
  const statusEl = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");
  const optionsLink = document.getElementById("optionsLink");
  const successOverlay = document.getElementById("successOverlay");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  jobTitleEl.value = tab?.title || "";
  jobUrlEl.value = tab?.url || "";

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Enter in any field submits the form
  for (const el of [jobTitleEl, companyEl, jobUrlEl]) {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !saveBtn.disabled) {
        e.preventDefault();
        saveJob();
      }
    });
  }

  function showSuccessAndClose() {
    successOverlay.classList.add("visible");
    // Let the checkmark animation play for 2s, then close the popup.
    setTimeout(() => window.close(), 2000);
  }

  async function saveJob() {
    const { apiToken, apiBaseUrl } = await chrome.storage.local.get(["apiToken", "apiBaseUrl"]);

    if (!apiToken || !apiBaseUrl) {
      statusEl.textContent = "Set up your API token and site URL in Options first.";
      statusEl.style.color = "#D97706";
      return;
    }

    statusEl.textContent = "Savingâ€¦";
    statusEl.style.color = "#94A3B8";
    saveBtn.disabled = true;

    try {
      const res = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/applications/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          jobTitle: jobTitleEl.value,
          company: companyEl.value,
          jobUrl: jobUrlEl.value,
        }),
      });

      if (res.ok) {
        statusEl.textContent = "";
        showSuccessAndClose();
        return; // keep the button disabled while the overlay plays out
      } else {
        const data = await res.json().catch(() => ({}));
        statusEl.textContent = data.error || "Failed to save.";
        statusEl.style.color = "#94A3B8";
      }
    } catch (err) {
      statusEl.textContent = "Network error - check the site URL in Options.";
      statusEl.style.color = "#94A3B8";
    }
    saveBtn.disabled = false;
  }

  saveBtn.addEventListener("click", saveJob);
});
