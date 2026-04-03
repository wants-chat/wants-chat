/**
 * Wedding Component Generators Index
 *
 * Exports all wedding planning component generators for the app creator.
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
