// Background service worker for Wants extension

// Listen for auth sync messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_SYNC') {
    // Store the auth data
    const authData = {
      authToken: message.token,
      user: message.user,
      syncedAt: Date.now()
    };

    chrome.storage.local.set(authData, () => {
      console.log('Wants: Auth data synced from website');
      sendResponse({ success: true });
    });

    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_AUTH_STATUS') {
    chrome.storage.local.get(['authToken', 'user', 'syncedAt'], (result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === 'CLEAR_AUTH') {
    chrome.storage.local.remove(['authToken', 'user', 'syncedAt'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// When extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Wants extension installed/updated:', details.reason);
});

console.log('Wants: Background service worker started');
