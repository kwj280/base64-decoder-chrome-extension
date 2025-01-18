// background.js

// 1) Create a context menu item on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decodeBase64",
    title: "Decode Base64",
    contexts: ["selection"]
  });
});

// 2) Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "decodeBase64" && info.selectionText) {
    let decodedText;
    try {
      decodedText = atob(info.selectionText);
    } catch (error) {
      decodedText = "Invalid Base64 string.";
    }

    // Inject a script that shows our custom panel on the webpage
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showDecodedPanel,
      args: [decodedText]
    });
  }
});


/**
 * This function is injected into the page.
 * It creates a floating panel to display the decoded text.
 * If the decoded text is a valid URL, it displays an anchor link;
 * otherwise, it displays a textarea.
 */
function showDecodedPanel(decodedText) {


  function isValidURL(str) {
    try {
      // If the constructor doesn't throw, it's a valid URL
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Remove any existing panel
  const existingPanel = document.getElementById("base64-decoder-panel");
  if (existingPanel) existingPanel.remove();

  // Create the panel container
  const panel = document.createElement("div");
  panel.id = "base64-decoder-panel";
  panel.style.position = "fixed";
  panel.style.top = "20px";
  panel.style.right = "20px";
  panel.style.zIndex = "999999";
  panel.style.width = "300px";
  panel.style.padding = "10px";
  panel.style.backgroundColor = "#1f1f1f";
  panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  panel.style.borderRadius = "4px";
  panel.style.fontFamily = "sans-serif";

  // Title
  const title = document.createElement("div");
  title.textContent = "Decoded Text:";
  title.style.marginBottom = "8px";
  title.style.fontWeight = "bold";
  panel.appendChild(title);

  // Content area: link if valid URL, otherwise textarea
  let contentElement;
  if (isValidURL(decodedText)) {
    // Display as clickable link
    contentElement = document.createElement("a");
    contentElement.href = decodedText;
    contentElement.textContent = decodedText;
    contentElement.target = "_blank";
    contentElement.style.wordWrap = "break-word";
  } else {
    // Display in a textarea with dark background
    contentElement = document.createElement("textarea");
    contentElement.value = decodedText;
    contentElement.rows = 5;
    contentElement.style.width = "100%";
    contentElement.style.boxSizing = "border-box";
    contentElement.style.backgroundColor = "#1f1f1f";
    contentElement.style.color = "#ffffff";
    contentElement.style.border = "1px solid #333";
    contentElement.style.fontFamily = "sans-serif";
    contentElement.style.padding = "8px";
    contentElement.style.resize = "vertical";
  }
  panel.appendChild(contentElement);

  // Add a bit of spacing
  panel.appendChild(document.createElement("br"));
  panel.appendChild(document.createElement("br"));

  // Copy button
  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.style.marginRight = "10px";
  copyButton.style.backgroundColor = "#007BFF";
  copyButton.style.color = "#fff";
  copyButton.style.border = "none";
  copyButton.style.borderRadius = "4px";
  copyButton.style.padding = "8px 12px";
  copyButton.style.cursor = "pointer";
  copyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(decodedText);
      copyButton.textContent = "Copied!";
      setTimeout(() => (copyButton.textContent = "Copy"), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  panel.appendChild(copyButton);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.backgroundColor = "#dc3545";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "4px";
  closeButton.style.padding = "8px 12px";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = () => panel.remove();
  panel.appendChild(closeButton);

  document.body.appendChild(panel);
}