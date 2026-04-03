/**
 * Fitness Features Registry
 *
 * Comprehensive fitness industry features for gyms, yoga studios,
 * CrossFit boxes, martial arts schools, and fitness facilities.
 *
 * Features included:
 * - Class Scheduling: Fitness class calendar and signups
 * - Membership Plans: Gym membership management
 * - Workout Tracking: Exercise logging and progress
 * - Trainer Booking: Personal training sessions
 * - Body Measurements: Body composition tracking
 * - Nutrition Tracking: Food diary and meal plans
 * - Fitness Challenges: Competitions and leaderboards
 * - Class Packages: Credit-based class booking
 * - Equipment Booking: Gym equipment reservations
 * - Group Training: Team workouts and bootcamps
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

// Export individual features
export { CLASS_SCHEDULING_FEATURE } from './class-scheduling';
export { MEMBERSHIP_PLANS_FEATURE } from './membership-plans';
export { WORKOUT_TRACKING_FEATURE } from './workout-tracking';
export { TRAINER_BOOKING_FEATURE } from './trainer-booking';
export { BODY_MEASUREMENTS_FEATURE } from './body-measurements';
export { NUTRITION_TRACKING_FEATURE } from './nutrition-tracking';
export { FITNESS_CHALLENGES_FEATURE } from './fitness-challenges';
export { CLASS_PACKAGES_FEATURE } from './class-packages';
export { EQUIPMENT_BOOKING_FEATURE } from './equipment-booking';
export { GROUP_TRAINING_FEATURE } from './group-training';

// Import for collection
import { CLASS_SCHEDULING_FEATURE } from './class-scheduling';
import { MEMBERSHIP_PLANS_FEATURE } from './membership-plans';
import { WORKOUT_TRACKING_FEATURE } from './workout-tracking';
import { TRAINER_BOOKING_FEATURE } from './trainer-booking';
import { BODY_MEASUREMENTS_FEATURE } from './body-measurements';
import { NUTRITION_TRACKING_FEATURE } from './nutrition-tracking';
import { FITNESS_CHALLENGES_FEATURE } from './fitness-challenges';
import { CLASS_PACKAGES_FEATURE } from './class-packages';
import { EQUIPMENT_BOOKING_FEATURE } from './equipment-booking';
import { GROUP_TRAINING_FEATURE } from './group-training';

/**
 * All fitness features collection
 */
export const FITNESS_FEATURES: FeatureDefinition[] = [
  CLASS_SCHEDULING_FEATURE,
  MEMBERSHIP_PLANS_FEATURE,
  WORKOUT_TRACKING_FEATURE,
  TRAINER_BOOKING_FEATURE,
  BODY_MEASUREMENTS_FEATURE,
  NUTRITION_TRACKING_FEATURE,
  FITNESS_CHALLENGES_FEATURE,
  CLASS_PACKAGES_FEATURE,
  EQUIPMENT_BOOKING_FEATURE,
  GROUP_TRAINING_FEATURE,
];

/**
 * Fitness features by ID for quick lookup
 */
export const FITNESS_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  FITNESS_FEATURES.map(f => [f.id, f])
);

/**
 * Get fitness feature by ID
 */
export function getFitnessFeatureById(id: string): FeatureDefinition | undefined {
  return FITNESS_FEATURES_BY_ID.get(id);
}

/**
 * Get all fitness features for a specific app type
 */
export function getFitnessFeaturesForAppType(appType: string): FeatureDefinition[] {
  return FITNESS_FEATURES.filter(f => f.includedInAppTypes.includes(appType));
}

/**
 * Get default fitness features (enabled by default)
 */
export function getDefaultFitnessFeatures(): FeatureDefinition[] {
  return FITNESS_FEATURES.filter(f => f.enabledByDefault);
}

/**
 * Get optional fitness features
 */
export function getOptionalFitnessFeatures(): FeatureDefinition[] {
  return FITNESS_FEATURES.filter(f => f.optional);
}
