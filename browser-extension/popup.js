document.addEventListener("DOMContentLoaded", async () => {
  const jobTitleEl = document.getElementById("jobTitle");
  const companyEl = document.getElementById("company");
  const jobUrlEl = document.getElementById("jobUrl");
  const statusEl = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");
  const optionsLink = document.getElementById("optionsLink");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  jobTitleEl.value = tab?.title || "";
  jobUrlEl.value = tab?.url || "";

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  saveBtn.addEventListener("click", async () => {
    const { apiToken, apiBaseUrl } = await chrome.storage.local.get(["apiToken", "apiBaseUrl"]);

    if (!apiToken || !apiBaseUrl) {
      statusEl.textContent = "Set up your API token and site URL in Options first.";
      statusEl.style.color = "#B26A00";
      return;
    }

    statusEl.textContent = "Saving…";
    statusEl.style.color = "#C9C5BA";
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
        statusEl.textContent = "Saved ✓";
        statusEl.style.color = "#6FB3A8";
      } else {
        const data = await res.json().catch(() => ({}));
        statusEl.textContent = data.error || "Failed to save.";
        statusEl.style.color = "#B5544B";
      }
    } catch (err) {
      statusEl.textContent = "Network error - check the site URL in Options.";
      statusEl.style.color = "#B5544B";
    } finally {
      saveBtn.disabled = false;
    }
  });
});
