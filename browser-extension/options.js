document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrlEl = document.getElementById("apiBaseUrl");
  const apiTokenEl = document.getElementById("apiToken");
  const statusEl = document.getElementById("status");

  const { apiBaseUrl, apiToken } = await chrome.storage.local.get(["apiBaseUrl", "apiToken"]);
  if (apiBaseUrl) apiBaseUrlEl.value = apiBaseUrl;
  if (apiToken) apiTokenEl.value = apiToken;

  document.getElementById("saveBtn").addEventListener("click", async () => {
    await chrome.storage.local.set({
      apiBaseUrl: apiBaseUrlEl.value.trim(),
      apiToken: apiTokenEl.value.trim(),
    });
    statusEl.textContent = "Saved ✓";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
});
