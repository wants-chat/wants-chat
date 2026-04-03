/**
 * Pet Component Generators Index
 *
 * Exports all pet-related component generators for:
 * - Pet Boarding facilities
 * - Pet Daycare centers
 * - Veterinary clinics
 */

// ============================================
// BOARDING COMPONENTS
// ============================================

export {
  generatePetboardingStats,
  generateCalendarPetboarding,
  generateStaffScheduleBoarding,
  generatePetProfileBoarding,
  generateCurrentPets,
  generatePetActivities,
  generateFeedingSchedule,
  type BoardingStatsOptions,
  type CalendarBoardingOptions,
  type StaffScheduleOptions,
  type PetProfileBoardingOptions,
  type CurrentPetsOptions,
  type PetActivitiesOptions,
  type FeedingScheduleOptions,
} from './boarding.generator';

// ============================================
// DAYCARE COMPONENTS
// ============================================

export {
  generateDaycareStats,
  generateActivityCalendarDaycare,
  generateCheckinListToday,
  generateChildProfile,
  type DaycareStatsOptions,
  type ActivityCalendarOptions,
  type CheckinListOptions,
  type ChildProfileOptions,
} from './daycare.generator';

// ============================================
// VETERINARY COMPONENTS
// ============================================

export {
  generatePetProfile,
  generateOwnerProfile,
  type PetProfileVetOptions,
  type OwnerProfileOptions,
} from './vet.generator';
