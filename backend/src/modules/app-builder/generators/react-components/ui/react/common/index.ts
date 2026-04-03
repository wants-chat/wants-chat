// Common Component Generators
import * as changeCase from 'change-case';
import { generateConnectionLostBanner } from './connection-lost-banner.generator';
import { generateCookieConsentDetailed } from './cookie-consent-detailed.generator';
import { generateCookieConsentSimple } from './cookie-consent-simple.generator';
import { generateFontSizeAdjuster } from './font-size-adjuster.generator';
import { generateFooterMinimal } from './footer-minimal.generator';
import { generateFooterMultiColumn } from './footer-multi-column.generator';
import { generateFooter } from './footer.generator';
import { generateHeroCentered } from './hero-centered.generator';
import { generateHeroFullWidth } from './hero-full-width.generator';
import { generateHeroSection } from './hero-section.generator';
import { generateHeroSplitLayout } from './hero-split-layout.generator';
import { generateHighContrastMode } from './high-contrast-mode.generator';
import { generateLoadingStateSpinner } from './loading-state-spinner.generator';
import { generateNoResultsFound } from './no-results-found.generator';
import { generateOfflineModeInterface } from './offline-mode-interface.generator';
import { generateOnboardingFlow } from './onboarding-flow.generator';
import { generateScreenReaderAnnouncements } from './screen-reader-announcements.generator';
import { generateSkeletonScreen } from './skeleton-screen.generator';
import { generateSkipNavigation } from './skip-navigation.generator';
import { generateStatusPageService } from './status-page-service.generator';
import { generateSuccessMessage } from './success-message.generator';
import { generateSystemNotifications } from './system-notifications.generator';
import { generateThemeToggle } from './theme-toggle.generator';

export { generateConnectionLostBanner } from './connection-lost-banner.generator';
export { generateCookieConsentDetailed } from './cookie-consent-detailed.generator';
export { generateCookieConsentSimple } from './cookie-consent-simple.generator';
export { generateFontSizeAdjuster } from './font-size-adjuster.generator';
export { generateFooterMinimal } from './footer-minimal.generator';
export { generateFooterMultiColumn } from './footer-multi-column.generator';
export { generateFooter } from './footer.generator';
export { generateHeroCentered } from './hero-centered.generator';
export { generateHeroFullWidth } from './hero-full-width.generator';
export { generateHeroSection } from './hero-section.generator';
export { generateHeroSplitLayout } from './hero-split-layout.generator';
export { generateHighContrastMode } from './high-contrast-mode.generator';
export { generateLoadingStateSpinner } from './loading-state-spinner.generator';
export { generateNoResultsFound } from './no-results-found.generator';
export { generateOfflineModeInterface } from './offline-mode-interface.generator';
export { generateOnboardingFlow } from './onboarding-flow.generator';
export { generateScreenReaderAnnouncements } from './screen-reader-announcements.generator';
export { generateSkeletonScreen } from './skeleton-screen.generator';
export { generateSkipNavigation } from './skip-navigation.generator';
export { generateStatusPageService } from './status-page-service.generator';
export { generateSuccessMessage } from './success-message.generator';
export { generateSystemNotifications } from './system-notifications.generator';
export { generateThemeToggle } from './theme-toggle.generator';

// Helper function to check if a common component generator exists
const commonGeneratorMap = {
  'connection-lost-banner': generateConnectionLostBanner,
  'connectionLostBanner': generateConnectionLostBanner,
  'cookie-consent-detailed': generateCookieConsentDetailed,
  'cookieConsentDetailed': generateCookieConsentDetailed,
  'cookie-consent': generateCookieConsentDetailed,
  'cookie-consent-simple': generateCookieConsentSimple,
  'cookieConsentSimple': generateCookieConsentSimple,
  'font-size-adjuster': generateFontSizeAdjuster,
  'fontSizeAdjuster': generateFontSizeAdjuster,
  'footer-minimal': generateFooterMinimal,
  'footerMinimal': generateFooterMinimal,
  'footer-multi-column': generateFooterMultiColumn,
  'footerMultiColumn': generateFooterMultiColumn,
  'footer': generateFooter,
  'hero-centered': generateHeroCentered,
  'heroCentered': generateHeroCentered,
  'hero-full-width': generateHeroFullWidth,
  'heroFullWidth': generateHeroFullWidth,
  'hero-section': generateHeroSection,
  'heroSection': generateHeroSection,
  'hero-split-layout': generateHeroSplitLayout,
  'heroSplitLayout': generateHeroSplitLayout,
  'high-contrast-mode': generateHighContrastMode,
  'highContrastMode': generateHighContrastMode,
  'loading-state-spinner': generateLoadingStateSpinner,
  'loadingStateSpinner': generateLoadingStateSpinner,
  'no-results-found': generateNoResultsFound,
  'noResultsFound': generateNoResultsFound,
  'offline-mode-interface': generateOfflineModeInterface,
  'offlineModeInterface': generateOfflineModeInterface,
  'onboarding-flow': generateOnboardingFlow,
  'onboardingFlow': generateOnboardingFlow,
  'screen-reader-announcements': generateScreenReaderAnnouncements,
  'screenReaderAnnouncements': generateScreenReaderAnnouncements,
  'skeleton-screen': generateSkeletonScreen,
  'skeletonScreen': generateSkeletonScreen,
  'skip-navigation': generateSkipNavigation,
  'skipNavigation': generateSkipNavigation,
  'status-page-service': generateStatusPageService,
  'statusPageService': generateStatusPageService,
  'success-message': generateSuccessMessage,
  'successMessage': generateSuccessMessage,
  'system-notifications': generateSystemNotifications,
  'systemNotifications': generateSystemNotifications,
  'theme-toggle': generateThemeToggle,
  'themeToggle': generateThemeToggle,
};

export function getCommonComponentGenerator(componentType: string) {
  // Try exact match first
  if (commonGeneratorMap[componentType]) {
    return commonGeneratorMap[componentType];
  }

  // Try kebab-case version
  const kebabCase = changeCase.kebabCase(componentType);
  if (commonGeneratorMap[kebabCase]) {
    return commonGeneratorMap[kebabCase];
  }

  return undefined;
}
