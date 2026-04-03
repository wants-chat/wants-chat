/**
 * Pet Services Components (React Native)
 *
 * This module exports all pet service component generators for React Native apps.
 * Includes components for:
 * - Pet Boarding facilities
 * - Pet Daycare centers
 * - Veterinary clinics
 */

// Pet Boarding components
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

// Pet Daycare components
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

// Veterinary components
export {
  generatePetProfile,
  generateOwnerProfile,
  type PetProfileVetOptions,
  type OwnerProfileOptions,
} from './vet.generator';
