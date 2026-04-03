/**
 * Dating Component Generators Index
 *
 * Exports all dating-related component generators for app creation.
 */

// Profile Components
export {
  generateDatingProfile,
  generateProfilePreview,
  generateProfileStats,
  generateAthleteProfile,
  generateArtistProfile,
  type DatingProfileOptions,
} from './profile.generator';

// Matching Components
export {
  generateSwipeCards,
  generateMatchCard,
  generateDiscoveryFilters,
  generateIcebreakers,
  type MatchingOptions,
} from './matching.generator';

// Chat Components
export {
  generateChatWindowDating,
  type DatingChatOptions,
} from './chat.generator';
