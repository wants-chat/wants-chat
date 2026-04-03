/**
 * Creative/Design Component Generators for React Native
 *
 * Provides generators for art galleries, photography, and design businesses.
 */

// Gallery Components
export {
  generateGalleryStats,
  generateSalesStatsGallery,
  generateArtworkFilters,
  generatePhotoGallery,
  type GalleryGeneratorOptions,
} from './gallery.generator';

// Artist Components
export {
  generateArtistProfileGallery,
  type ArtistGeneratorOptions,
} from './artist.generator';

// Photo Components
export {
  generatePhotoStats,
  generateBookingCalendarPhoto,
  generateClientProfilePhoto,
  type PhotoGeneratorOptions,
} from './photo.generator';

// Design Components
export {
  generateDesignStats,
  generateClientProfileDesign,
  type DesignGeneratorOptions,
} from './design.generator';
