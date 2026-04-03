/**
 * Hospitality Component Generators Index
 *
 * Exports all hospitality-related component generators for:
 * - Hotel management
 * - Campground/RV park management
 * - Marina/boat slip management
 * - Parking lot/garage management
 * - Coworking space management
 */

// ============================================
// HOTEL COMPONENTS
// ============================================

export {
  generateHotelStats,
  generateRoomFiltersHotel,
  generateRoomCalendar,
  generateRoomStatusOverview,
  generateGuestProfileHotel,
  generateGuestStats,
  generateHousekeepingBoard,
  generateOccupancyChart,
  type HotelOptions,
} from './hotel.generator';

// ============================================
// CAMPGROUND COMPONENTS
// ============================================

export {
  generateCampgroundStats,
  generateReservationCalendarCampground,
  generateActivityCalendarCampground,
  generateSiteAvailability,
  generateSiteSchedule,
  type CampgroundOptions,
} from './campground.generator';

// ============================================
// MARINA COMPONENTS
// ============================================

export {
  generateMarinaStats,
  generateReservationCalendarMarina,
  generateReservationListTodayMarina,
  generateSlipAvailability,
  generateCustomerProfileMarina,
  type MarinaOptions,
} from './marina.generator';

// ============================================
// PARKING COMPONENTS
// ============================================

export {
  generateParkingStats,
  generateOccupancyOverviewParking,
  generateReservationFiltersParking,
  generateCustomerProfileParking,
  type ParkingOptions,
} from './parking.generator';

// ============================================
// COWORKING COMPONENTS
// ============================================

export {
  generateCoworkingStats,
  generateBookingCalendarCoworking,
  generateBookingListCoworking,
  generateMemberProfileCoworking,
  generateSpaceCalendar,
  type CoworkingOptions,
} from './coworking.generator';
