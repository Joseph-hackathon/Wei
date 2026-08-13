/**
 * EIP Nexus — Background Service Worker
 * Handles World ID proof requests from content script
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REQUEST_WORLD_ID_PROOF") {
    handleWorldIDProof(message.address, message.prId)
      .then((proof) => sendResponse({ proof }))
      .catch(() => sendResponse({ proof: null }));
    return true; // Keep channel open for async response
  }
});

async function handleWorldIDProof(address, prId) {
  // Open World ID IDKit popup window
  const popup = await chrome.windows.create({
    url: chrome.runtime.getURL("worldid.html") + `?address=${address}&prId=${prId}`,
    type: "popup",
    width: 420,
    height: 600,
  });

  return new Promise((resolve) => {
    // Listen for proof from the popup
    const listener = (msg, sender) => {
      if (msg.type === "WORLD_ID_PROOF_RESULT" && sender.tab?.windowId === popup.id) {
        chrome.runtime.onMessage.removeListener(listener);
        chrome.windows.remove(popup.id).catch(() => {});
        resolve(msg.proof);
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    // Timeout after 3 minutes
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(listener);
      chrome.windows.remove(popup.id).catch(() => {});
      resolve(null);
    }, 3 * 60 * 1000);
  });
}
