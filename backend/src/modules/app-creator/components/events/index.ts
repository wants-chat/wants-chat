/**
 * Events Component Generators Index
 */

export { generateEventGrid, generateEventFilters, type EventGridOptions } from './event-grid.generator';
export { generateEventHeader, generateEventSchedule, generateVenueInfo, type EventDetailOptions } from './event-detail.generator';
export { generateTicketSelector, generateTicketList, generateTicketDetail, type TicketOptions } from './ticket.generator';
export { generateSpeakerGrid, generateSponsorGrid, type SpeakerGridOptions } from './speaker-grid.generator';

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
