import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { userService, AppPreferencesResponse } from '../services/userService';

// All available app IDs - organized by category (matches mobile app_selection_screen.dart)
// Total: 70 apps
export const ALL_APP_IDS = [
  // Life Management (12 apps)
  'habit-tracker',
  'meditation',
  'fitness',
  'calories-tracker',
  'health-tracker',
  'recipe-builder',
  'expense-tracker',
  'currency-converter',
  'travel-planner',
  'language-learner',
  'blog',
  'todo',

  // AI Tools (16 apps)
  'ai-image-generator',
  'ai-translator',
  'ai-text-to-speech',
  'ai-speech-to-text',
  'ai-resume-builder',
  'ai-cover-letter',
  'ai-email-composer',
  'ai-social-captions',
  'ai-hashtag-generator',
  'ai-video-script',
  'ai-meeting-notes',
  'ai-study-notes',
  'ai-contract-analyzer',
  'ai-legal-document',
  'ai-tax-calculator',
  'ai-investment-advisor',

  // Productivity (4 apps)
  'notes',
  'password-manager',
  'ebook-reader',
  'billing-system',

  // Developer Tools (7 apps)
  'text-tools',
  'encoding-tools',
  'units-tools',
  'images-tools',
  'qr-barcode',
  'docs-tools',
  'media-tools',

  // Utilities (5 apps)
  'internet-speed',
  'file-transfer',
  'compass-qibla',
  'flashlight',
  'receipt-scanner',

  // Media & Entertainment (5 apps)
  'podcast-player',
  'photo-gallery',
  'music-player',
  'video-player',
  'audio-recorder',

  // Security & Privacy (3 apps)
  'vpn',
  'two-factor-auth',
  'ciphertext',

  // Sensors & Detection (7 apps)
  'pedometer',
  'magnifier',
  'vibration-detector',
  'light-detector',
  'color-detector',
  'nfc-scanner',
  'room-temperature',

  // Calculators & Tools (4 apps)
  'jewellery-calculator',
  'protractor',
  'resistor-codes',
  'inductor-codes',

  // Camera Utilities (2 apps)
  'night-mode-cam',
  'blank-cam',

  // Home & Life (5 apps)
  'home-repair',
  'pet-care',
  'bill-reminder',
  'investment-tracker',
  'event-reminder',
] as const;

// App categories for grouping in UI
export const APP_CATEGORIES = {
  'Life Management': [
    'habit-tracker', 'meditation', 'fitness', 'calories-tracker', 'health-tracker',
    'recipe-builder', 'expense-tracker', 'currency-converter',
    'travel-planner', 'language-learner', 'blog', 'todo'
  ],
  'AI Tools': [
    'ai-image-generator', 'ai-translator', 'ai-text-to-speech', 'ai-speech-to-text',
    'ai-resume-builder', 'ai-cover-letter', 'ai-email-composer', 'ai-social-captions',
    'ai-hashtag-generator', 'ai-video-script', 'ai-meeting-notes', 'ai-study-notes',
    'ai-contract-analyzer', 'ai-legal-document', 'ai-tax-calculator', 'ai-investment-advisor'
  ],
  'Productivity': ['notes', 'password-manager', 'ebook-reader', 'billing-system'],
  'Developer Tools': ['text-tools', 'encoding-tools', 'units-tools', 'images-tools', 'qr-barcode', 'docs-tools', 'media-tools'],
  'Utilities': ['internet-speed', 'file-transfer', 'compass-qibla', 'flashlight', 'receipt-scanner'],
  'Media & Entertainment': ['podcast-player', 'photo-gallery', 'music-player', 'video-player', 'audio-recorder'],
  'Security & Privacy': ['vpn', 'two-factor-auth', 'ciphertext'],
  'Sensors & Detection': ['pedometer', 'magnifier', 'vibration-detector', 'light-detector', 'color-detector', 'nfc-scanner', 'room-temperature'],
  'Calculators & Tools': ['jewellery-calculator', 'protractor', 'resistor-codes', 'inductor-codes'],
  'Camera Utilities': ['night-mode-cam', 'blank-cam'],
  'Home & Life': ['home-repair', 'pet-care', 'bill-reminder', 'investment-tracker', 'event-reminder'],
} as const;

// Mobile-only apps (not available on web)
export const MOBILE_ONLY_APPS = [
  // Developer Tools
  'text-tools', 'encoding-tools', 'units-tools', 'images-tools', 'qr-barcode', 'docs-tools', 'media-tools',
  // Utilities
  'file-transfer', 'compass-qibla', 'flashlight', 'receipt-scanner',
  // Media & Entertainment
  'podcast-player', 'photo-gallery', 'music-player', 'video-player', 'audio-recorder',
  // Security & Privacy
  'vpn', 'two-factor-auth', 'ciphertext',
  // Sensors & Detection
  'pedometer', 'magnifier', 'vibration-detector', 'light-detector', 'color-detector', 'nfc-scanner', 'room-temperature',
  // Calculators & Tools
  'jewellery-calculator', 'protractor', 'resistor-codes', 'inductor-codes',
  // Camera Utilities
  'night-mode-cam', 'blank-cam',
  // Others
  'password-manager',
] as const;

export type AppId = typeof ALL_APP_IDS[number];

interface AppPreferencesContextType {
  selectedApps: string[];
  appOnboardingCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  updateSelectedApps: (apps: string[]) => Promise<void>;
  setAppOnboardingCompleted: (completed: boolean) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  isAppSelected: (appId: string) => boolean;
}

const AppPreferencesContext = createContext<AppPreferencesContextType | undefined>(undefined);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedApps, setSelectedApps] = useState<string[]>(ALL_APP_IDS as unknown as string[]);
  const [appOnboardingCompleted, setAppOnboardingCompletedState] = useState<boolean>(false);
  // Start with isLoading=true to prevent redirect before API response
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch app preferences from API
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Reset to defaults for unauthenticated users
      setSelectedApps(ALL_APP_IDS as unknown as string[]);
      setAppOnboardingCompletedState(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: AppPreferencesResponse = await userService.getAppPreferences();

      // If selected apps is empty or undefined, default to all apps
      const apps = response.selectedApps && response.selectedApps.length > 0
        ? response.selectedApps
        : ALL_APP_IDS as unknown as string[];

      setSelectedApps(apps);
      setAppOnboardingCompletedState(response.appOnboardingCompleted || false);
    } catch (err) {
      console.error('Failed to fetch app preferences:', err);
      setError('Failed to load app preferences');
      // On error, default to all apps
      setSelectedApps(ALL_APP_IDS as unknown as string[]);
      setAppOnboardingCompletedState(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch preferences when user authenticates
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update selected apps
  const updateSelectedApps = useCallback(async (apps: string[]) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to update preferences');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.updateAppPreferences(apps, true);
      setSelectedApps(response.selectedApps);
      setAppOnboardingCompletedState(response.appOnboardingCompleted);
    } catch (err) {
      console.error('Failed to update app preferences:', err);
      setError('Failed to update app preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Set app onboarding completed
  const setAppOnboardingCompleted = useCallback(async (completed: boolean) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to update preferences');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.updateAppPreferences(selectedApps, completed);
      setAppOnboardingCompletedState(response.appOnboardingCompleted);
    } catch (err) {
      console.error('Failed to update onboarding status:', err);
      setError('Failed to update onboarding status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedApps]);

  // Refresh preferences from API
  const refreshPreferences = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Check if an app is selected
  const isAppSelected = useCallback((appId: string): boolean => {
    // If not authenticated or no apps selected, show all apps
    if (!isAuthenticated || selectedApps.length === 0) {
      return true;
    }
    return selectedApps.includes(appId);
  }, [isAuthenticated, selectedApps]);

  const value = useMemo(() => ({
    selectedApps,
    appOnboardingCompleted,
    isLoading,
    error,
    updateSelectedApps,
    setAppOnboardingCompleted,
    refreshPreferences,
    isAppSelected
  }), [
    selectedApps,
    appOnboardingCompleted,
    isLoading,
    error,
    updateSelectedApps,
    setAppOnboardingCompleted,
    refreshPreferences,
    isAppSelected
  ]);

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = (): AppPreferencesContextType => {
  const context = useContext(AppPreferencesContext);
  if (context === undefined) {
    throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  }
  return context;
};

export default AppPreferencesContext;
