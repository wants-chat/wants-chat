/**
 * Creative/Design Component Generators Index
 *
 * Exports all creative and design-related component generators
 * for galleries, artists, photography, and design businesses.
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

// Photography Components
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
