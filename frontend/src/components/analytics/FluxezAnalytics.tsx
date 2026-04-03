/**
 * Fluxez Analytics Integration for Wants AI
 *
 * Lightweight, privacy-first analytics similar to Plausible/Umami
 * Uses a simple script tag approach - no SDK required
 *
 * Usage:
 * <script defer data-api-key="anon_xxx" src="https://api.fluxez.com/js/analytics.js"></script>
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Get configuration from environment
const FLUXEZ_API_KEY = import.meta.env.VITE_FLUXEZ_ANON_KEY || '';
const FLUXEZ_API_URL = import.meta.env.VITE_FLUXEZ_API_URL || 'https://api.fluxez.com';

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  return Boolean(FLUXEZ_API_KEY && FLUXEZ_API_KEY.startsWith('anon_'));
};

interface FluxezAnalyticsProps {
  debug?: boolean;
}

/**
 * Fluxez Analytics Component
 *
 * Drop-in component that loads Fluxez Analytics script
 * Place in App.tsx to enable tracking
 *
 * @example
 * ```tsx
 * // In App.tsx
 * import { FluxezAnalytics } from './components/analytics/FluxezAnalytics';
 *
 * function App() {
 *   return (
 *     <>
 *       <FluxezAnalytics debug={process.env.NODE_ENV === 'development'} />
 *       <Routes>...</Routes>
 *     </>
 *   );
 * }
 * ```
 */
export const FluxezAnalytics: React.FC<FluxezAnalyticsProps> = ({ debug = false }) => {
  const location = useLocation();

  useEffect(() => {
    // Skip if API key is not configured
    if (!isAnalyticsEnabled()) {
      if (debug) {
        console.log('[Fluxez Analytics] Not configured - set VITE_FLUXEZ_ANON_KEY');
      }
      return;
    }

    // Check if script is already loaded (persists across StrictMode remounts)
    const existingScript = document.getElementById('fluxez-analytics-script');
    if (existingScript) {
      if (debug) {
        console.log('[Fluxez Analytics] Script already loaded');
      }
      return;
    }

    // Create and inject the script tag
    const script = document.createElement('script');
    script.id = 'fluxez-analytics-script';
    script.defer = true;
    script.src = `${FLUXEZ_API_URL}/js/analytics.js`;
    script.setAttribute('data-api-key', FLUXEZ_API_KEY);
    script.setAttribute('data-api-url', FLUXEZ_API_URL);
    if (debug) {
      script.setAttribute('data-debug', 'true');
    }

    if (debug) {
      console.log('[Fluxez Analytics] Initializing with API URL:', FLUXEZ_API_URL);
    }

    script.onload = () => {
      if (debug) {
        console.log('[Fluxez Analytics] Script loaded successfully');
      }
    };

    script.onerror = (e) => {
      console.error('[Fluxez Analytics] Failed to load script', e);
    };

    document.head.appendChild(script);

    // No cleanup - let the script persist for the app lifetime
    // This prevents issues with React StrictMode double-mounting
  }, [debug]);

  // Track page views on route changes
  useEffect(() => {
    if (isAnalyticsEnabled() && window.fluxez) {
      window.fluxez.pageview();
      if (debug) {
        console.log('[Fluxez Analytics] Page view tracked:', location.pathname);
      }
    }
  }, [location.pathname, debug]);

  // This component doesn't render anything
  return null;
};

// Global fluxez interface (set by analytics.js script)
declare global {
  interface Window {
    fluxez?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
      pageview: () => void;
    };
  }
}

/**
 * Track a custom event
 *
 * @example
 * ```tsx
 * trackFluxezEvent('signup_started', { plan: 'pro' });
 * ```
 */
export const trackFluxezEvent = (
  eventName: string,
  properties?: Record<string, unknown>
): void => {
  if (window.fluxez) {
    window.fluxez.track(eventName, properties);
  }
};

/**
 * Track page view manually (usually auto-tracked)
 */
export const trackFluxezPageView = (): void => {
  if (window.fluxez) {
    window.fluxez.pageview();
  }
};

/**
 * Hook to access Fluxez Analytics
 * Returns the global fluxez object if available
 */
export const useFluxezAnalytics = () => {
  return window.fluxez || null;
};

export default FluxezAnalytics;
