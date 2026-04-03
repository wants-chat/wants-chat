/**
 * Fluxez Chatbot Integration for Wants
 *
 * Lightweight chatbot widget that loads via a simple script tag approach
 * Similar to FluxezAnalytics - no SDK required
 *
 * Usage:
 * <script defer data-api-key="anon_xxx" src="https://api.fluxez.com/js/chatbot.js"></script>
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Get configuration from environment
const FLUXEZ_API_KEY = import.meta.env.VITE_FLUXEZ_ANON_KEY || '';
const FLUXEZ_API_URL = import.meta.env.VITE_FLUXEZ_API_URL || 'https://api.fluxez.com';

// Check if chatbot is enabled
const isChatbotEnabled = (): boolean => {
  return Boolean(FLUXEZ_API_KEY && FLUXEZ_API_KEY.startsWith('anon_'));
};

// Auth pages where chatbot should be hidden (to avoid blocking forms)
const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

// Internal paths where chatbot should be hidden
const INTERNAL_PATH_PREFIXES = [
  '/chat',
  '/content',
  '/billing',
  '/settings',
  '/memories',
  '/preferences',
  '/profile',
  '/api-keys',
  '/organization',
  '/onboarding',
];

// Check if chatbot should be hidden on current path
const shouldHideChatbot = (pathname: string): boolean => {
  // Hide on auth pages
  if (AUTH_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return true;
  }
  // Hide on internal paths
  if (INTERNAL_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }
  return false;
};

interface FluxezChatbotProps {
  debug?: boolean;
}

// Style ID for hiding chatbot
const HIDE_STYLE_ID = 'fluxez-chatbot-hide-style';

// Helper to hide chatbot with CSS
const hideChatbot = () => {
  // Add hide CSS if not already present
  if (!document.getElementById(HIDE_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = HIDE_STYLE_ID;
    style.textContent = `
      #fluxez-chatbot-widget,
      #fluxez-chatbot,
      [id*="fluxez-chat"],
      [class*="fluxez-chat"],
      .fluxez-chatbot {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  // Also try to close via API
  if (window.fluxezChatbot) {
    window.fluxezChatbot.close();
  }
};

// Helper to show chatbot by removing hide CSS
const showChatbot = () => {
  const style = document.getElementById(HIDE_STYLE_ID);
  if (style) {
    style.remove();
  }
};

/**
 * Fluxez Chatbot Component
 *
 * Drop-in component that loads Fluxez Chatbot script
 * Place in App.tsx to enable the chat widget
 *
 * Configuration (colors, avatar, greeting, training) is managed via Fluxez dashboard:
 * - Development: https://dev.fluxez.com
 * - Production: https://fluxez.com
 */
export const FluxezChatbot: React.FC<FluxezChatbotProps> = ({
  debug = false,
}) => {
  const location = useLocation();

  // Effect to load the script (runs once)
  useEffect(() => {
    // Skip if API key is not configured
    if (!isChatbotEnabled()) {
      if (debug) {
        console.log('[Fluxez Chatbot] Not configured - set VITE_FLUXEZ_ANON_KEY');
      }
      return;
    }

    // Check if script is already loaded
    const existingScript = document.getElementById('fluxez-chatbot-script');
    if (existingScript) {
      if (debug) {
        console.log('[Fluxez Chatbot] Script already loaded');
      }
      return;
    }

    // Create and inject the script tag
    const script = document.createElement('script');
    script.id = 'fluxez-chatbot-script';
    script.defer = true;
    script.src = `${FLUXEZ_API_URL}/js/chatbot.js`;
    script.setAttribute('data-api-key', FLUXEZ_API_KEY);
    script.setAttribute('data-api-url', FLUXEZ_API_URL);

    if (debug) {
      console.log('[Fluxez Chatbot] Initializing...');
      console.log('[Fluxez Chatbot] API URL:', FLUXEZ_API_URL);
      console.log('[Fluxez Chatbot] API Key:', FLUXEZ_API_KEY.substring(0, 20) + '...');
    }

    script.onload = () => {
      if (debug) {
        console.log('[Fluxez Chatbot] Script loaded successfully');
      }
    };

    script.onerror = (e) => {
      console.error('[Fluxez Chatbot] Failed to load script', e);
    };

    document.head.appendChild(script);
  }, [debug]);

  // Effect to handle visibility based on route (runs on route change)
  useEffect(() => {
    if (!isChatbotEnabled()) {
      return;
    }

    const shouldHide = shouldHideChatbot(location.pathname);

    if (shouldHide) {
      if (debug) {
        console.log('[Fluxez Chatbot] Hiding on page:', location.pathname);
      }
      hideChatbot();

      // Keep checking for a bit in case script loads after navigation
      const intervalId = setInterval(hideChatbot, 300);
      const timeoutId = setTimeout(() => clearInterval(intervalId), 3000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    } else {
      if (debug) {
        console.log('[Fluxez Chatbot] Showing on page:', location.pathname);
      }
      showChatbot();
    }
  }, [location.pathname, debug]);

  // This component doesn't render anything - the script handles the DOM
  return null;
};

// Global fluxez chatbot interface (set by chatbot.js script)
declare global {
  interface Window {
    fluxezChatbot?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      sendMessage: (message: string) => void;
      setUser: (user: { id?: string; name?: string; email?: string }) => void;
      destroy: () => void;
    };
  }
}

/**
 * Open the chatbot widget
 */
export const openFluxezChatbot = (): void => {
  if (window.fluxezChatbot) {
    window.fluxezChatbot.open();
  }
};

/**
 * Close the chatbot widget
 */
export const closeFluxezChatbot = (): void => {
  if (window.fluxezChatbot) {
    window.fluxezChatbot.close();
  }
};

/**
 * Toggle the chatbot widget
 */
export const toggleFluxezChatbot = (): void => {
  if (window.fluxezChatbot) {
    window.fluxezChatbot.toggle();
  }
};

/**
 * Send a message programmatically
 */
export const sendFluxezMessage = (message: string): void => {
  if (window.fluxezChatbot) {
    window.fluxezChatbot.sendMessage(message);
  }
};

/**
 * Set user info for the chatbot
 */
export const setFluxezChatUser = (user: { id?: string; name?: string; email?: string }): void => {
  if (window.fluxezChatbot) {
    window.fluxezChatbot.setUser(user);
  }
};

/**
 * Hook to access Fluxez Chatbot
 * Returns the global fluxezChatbot object if available
 */
export const useFluxezChatbot = () => {
  return window.fluxezChatbot || null;
};

export default FluxezChatbot;
