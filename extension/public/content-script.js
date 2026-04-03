// Content script that runs on wants.chat to sync auth state with extension

(function() {
  // Function to decode JWT and extract payload
  function decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode the payload (middle part)
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      console.log('Wants extension: Could not decode JWT', e);
      return null;
    }
  }

  // Function to get auth token from localStorage/sessionStorage
  function getAuthToken() {
    // Try different common storage keys
    const keys = [
      'accessToken',
      'auth_token',
      'authToken',
      'token',
      'access_token',
      'jwt',
      'user_token',
      'wants_token'
    ];

    for (const key of keys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        return token;
      }
    }

    // Try to get from a user object
    const userKeys = ['user', 'auth', 'session'];
    for (const key of userKeys) {
      try {
        const data = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.token) return parsed.token;
          if (parsed.accessToken) return parsed.accessToken;
          if (parsed.auth_token) return parsed.auth_token;
        }
      } catch (e) {}
    }

    return null;
  }

  // Function to get user data from localStorage or JWT
  function getUserData(token) {
    // First try to get from localStorage
    const userKeys = ['user', 'auth', 'session', 'currentUser', 'fluxez_user'];
    for (const key of userKeys) {
      try {
        const data = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.email || parsed.user?.email) {
            return parsed.user || parsed;
          }
        }
      } catch (e) {}
    }

    // If no user in storage, decode from JWT token
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        return {
          id: payload.sub || payload.userId || payload.id,
          email: payload.email,
          name: payload.name || payload.firstName || payload.username,
          plan: payload.plan || payload.subscription?.plan || 'free'
        };
      }
    }

    return null;
  }

  // Check if extension context is still valid
  function isExtensionContextValid() {
    return !!(chrome.runtime && chrome.runtime.id);
  }

  // Send auth data to extension
  function syncAuthToExtension() {
    // Check if extension context is still valid (prevents "Extension context invalidated" error)
    if (!isExtensionContextValid()) {
      console.log('Wants extension: Context invalidated, skipping sync');
      return;
    }

    const token = getAuthToken();
    const user = getUserData(token);

    console.log('Wants extension: Syncing auth', { hasToken: !!token, user });

    if (token || user) {
      try {
        chrome.runtime.sendMessage({
          type: 'AUTH_SYNC',
          token: token,
          user: user
        }, (response) => {
          if (chrome.runtime.lastError) {
            // Extension might not be listening, that's ok
            console.log('Wants extension: Could not sync auth');
          } else {
            console.log('Wants extension: Auth synced successfully');
          }
        });
      } catch (e) {
        console.log('Wants extension: Error sending message', e.message);
      }
    }
  }

  // Sync on page load
  syncAuthToExtension();

  // Listen for storage changes (login/logout)
  window.addEventListener('storage', (e) => {
    syncAuthToExtension();
  });

  // Also sync periodically in case of dynamic updates
  setInterval(syncAuthToExtension, 5000);

  // Listen for messages from the extension popup
  if (isExtensionContextValid()) {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'GET_AUTH') {
          const token = getAuthToken();
          const user = getUserData(token);
          sendResponse({ token, user });
        }
        return true;
      });
    } catch (e) {
      console.log('Wants extension: Could not add message listener', e.message);
    }
  }

  console.log('Wants extension: Content script loaded on', window.location.hostname);
})();
