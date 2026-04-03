/**
 * Service Industry Component Generators Index (React Native)
 *
 * Exports all service industry component generators for:
 * - Auto Repair
 * - HVAC
 * - Plumbing
 * - Cleaning
 * - Moving
 * - Laundry
 * - Tailor
 * - Print Shop
 * - Storage
 */

// Auto Repair
export {
  generateAutorepairStats,
  generateCustomerProfileAutorepair,
  generateVehicleProfile,
  generateVehicleHistory,
  generateServiceCallListToday,
  generateRepairListPending,
  type AutorepairStatsOptions,
  type CustomerProfileAutorepairOptions,
  type VehicleProfileOptions,
  type VehicleHistoryOptions,
  type ServiceCallListTodayOptions,
  type RepairListPendingOptions,
} from './autorepair.generator';

// HVAC
export {
  generateHvacStats,
  generateCustomerDetailHvac,
  generateCustomerEquipmentHvac,
  generateServiceCallListTodayPlumbing,
  type HvacStatsOptions,
  type CustomerDetailHvacOptions,
  type CustomerEquipmentHvacOptions,
  type ServiceCallListTodayPlumbingOptions,
} from './hvac.generator';

// Plumbing
export {
  generatePlumbingStats,
  generateCustomerDetailPlumbing,
  type PlumbingStatsOptions,
  type CustomerDetailPlumbingOptions,
} from './plumbing.generator';

// Cleaning
export {
  generateCleaningStats,
  generateBookingCalendarCleaning,
  generateCleanerProfile,
  generateCleanerSchedule,
  generateCustomerProfileCleaning,
  type CleaningStatsOptions,
  type BookingCalendarCleaningOptions,
  type CleanerProfileOptions,
  type CleanerScheduleOptions,
  type CustomerProfileCleaningOptions,
} from './cleaning.generator';

// Moving
export {
  generateMovingStats,
  generateMoveCalendar,
  generateUpcomingMoves,
  generateCustomerProfileMoving,
  type MovingStatsOptions,
  type MoveCalendarOptions,
  type UpcomingMovesOptions,
  type CustomerProfileMovingOptions,
} from './moving.generator';

// Laundry
export {
  generateLaundryStats,
  generateOrderFiltersLaundry,
  generateOrderTimelineLaundry,
  generateCustomerProfileLaundry,
  type LaundryStatsOptions,
  type OrderFiltersLaundryOptions,
  type OrderTimelineLaundryOptions,
  type CustomerProfileLaundryOptions,
} from './laundry.generator';

// Tailor
export {
  generateTailorStats,
  generateFittingCalendar,
  generateFittingListToday,
  generateCustomerProfileTailor,
  type TailorStatsOptions,
  type FittingCalendarOptions,
  type FittingListTodayOptions,
  type CustomerProfileTailorOptions,
} from './tailor.generator';

// Print Shop
export {
  generatePrintshopStats,
  generateCustomerProfilePrintshop,
  type PrintshopStatsOptions,
  type CustomerProfilePrintshopOptions,
} from './printshop.generator';

// Storage
export {
  generateUnitAvailability,
  generateUnitFilters,
  generateCustomerProfileStorage,
  generateRenewalList,
  type UnitAvailabilityOptions,
  type UnitFiltersOptions,
  type CustomerProfileStorageOptions,
  type RenewalListOptions,
} from './storage.generator';
