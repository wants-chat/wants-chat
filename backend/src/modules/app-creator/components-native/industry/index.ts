/**
 * Industry Components (React Native)
 *
 * Re-exports all industry-related component generators for React Native apps.
 * Includes auction platforms, fitness/yoga studios, dance studios, medical/healthcare,
 * security management, and vehicle/fleet management.
 */

// Auction Components
export {
  generateAuctionFilters,
  generateAuctionTimer,
  generateBidForm,
  generateBidHistory,
  generateAuctionCard,
  type AuctionOptions,
} from './auction.generator';

// Fitness & Yoga Components
export {
  generateClassCalendarYoga,
  generateClassListTodayYoga,
  generateInstructorProfileYoga,
  generateInstructorScheduleYoga,
  generateMemberProfileYoga,
  generatePublicScheduleYoga,
  generateDanceStudioStatsView,
  type FitnessYogaOptions,
} from './fitness-yoga.generator';

// Dance Studio Components
export {
  generateClassFiltersDance,
  generateInstructorProfileDance,
  generateStudentProfileDance,
  generateScheduleCalendarDance,
  type DanceOptions,
} from './dance.generator';

// Medical/Healthcare Components
export {
  generatePatientAppointments,
  generateMedicalRecords,
  generateDoctorList,
  generateMedicationTracker,
  generateVitalStats,
  type MedicalOptions,
} from './medical.generator';

// Security Industry Components
export {
  generateGuardFilters,
  generateGuardListActive,
  generateGuardProfile,
  generateGuardSchedule,
  generateIncidentFilters,
  generateIncidentListRecent,
  generateScheduleCalendarSecurity,
  type SecurityOptions,
} from './security.generator';

// Vehicle/Fleet Management Components
export {
  generateVehicleFilters,
  generateVehicleCard,
  generateVehicleDetail,
  generateTruckSchedule,
  generateFleetStats,
  type VehicleOptions,
} from './vehicle.generator';
