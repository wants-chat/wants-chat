/**
 * Wedding Component Generators Index (React Native)
 *
 * Exports all wedding planning component generators for the app creator.
 * Native mobile versions using React Native patterns.
 */

// Wedding core components
export {
  generateWeddingStats,
  generateWeddingCountdown,
  generateWeddingTimeline,
  generateBudgetSummaryWedding,
  type WeddingOptions,
} from './wedding.generator';

// Task management components
export {
  generateTaskBoardWedding,
  generateTaskListWedding,
  type WeddingTaskOptions,
} from './tasks.generator';

// Venue management components
export {
  generateVenueCalendar,
  generateVenueStats,
  generateBookingFiltersVenue,
  generateClientProfileVenue,
  type VenueOptions,
} from './venue.generator';
