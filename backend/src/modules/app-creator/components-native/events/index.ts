/**
 * React Native Events Component Generators Index
 *
 * Provides generators for React Native event-related components:
 * - Event Grid with FlatList
 * - Event Detail views
 * - Ticket selection and management
 * - Speaker and Sponsor grids
 * - Arcade, Cinema, Escape Room, Club components
 * - Ticket Sales dashboard
 */

// Event Grid components
export {
  generateEventGrid,
  generateEventFilters,
  type EventGridOptions,
} from './event-grid.generator';

// Event Detail components
export {
  generateEventHeader,
  generateEventSchedule,
  generateVenueInfo,
  type EventDetailOptions,
} from './event-detail.generator';

// Ticket components
export {
  generateTicketSelector,
  generateTicketList,
  generateTicketDetail,
  type TicketOptions,
} from './ticket.generator';

// Speaker and Sponsor components
export {
  generateSpeakerGrid,
  generateSponsorGrid,
  type SpeakerGridOptions,
} from './speaker-grid.generator';

// Arcade components
export {
  generateArcadeStats,
  generateGameListPopular,
  generatePartyCalendarArcade,
  generatePartyListToday,
  type ArcadeOptions,
} from './arcade.generator';

// Cinema components
export {
  generateCinemaStats,
  generateScreeningCalendar,
  generateScreeningListToday,
  generateNowPlaying,
  generateMovieFilters,
  type CinemaOptions,
} from './cinema.generator';

// Escape Room components
export {
  generateEscapeRoomStats,
  generateBookingCalendarEscape,
  generateBookingListTodayEscape,
  generateRoomScheduleEscape,
  type EscapeRoomOptions,
} from './escape.generator';

// Club components
export {
  generateMemberFiltersClub,
  generateMemberProfileClub,
  generateEventCalendarClub,
  type ClubOptions,
} from './club.generator';

// Ticket Sales components
export {
  generateTicketStats,
  generateTicketSalesToday,
  generateTicketSalesRecent,
  type TicketSalesOptions,
} from './ticket-sales.generator';
