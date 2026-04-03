/**
 * Hospitality Features Registry
 *
 * Comprehensive hospitality industry features for restaurants,
 * hotels, cafes, bars, and other food service businesses.
 */

// ─────────────────────────────────────────────────────────────
// FEATURE EXPORTS
// ─────────────────────────────────────────────────────────────

export { TABLE_RESERVATIONS_FEATURE } from './table-reservations';
export { MENU_MANAGEMENT_FEATURE } from './menu-management';
export { KITCHEN_DISPLAY_FEATURE } from './kitchen-display';
export { ROOM_BOOKING_FEATURE } from './room-booking';
export { HOUSEKEEPING_FEATURE } from './housekeeping';
export { GUEST_SERVICES_FEATURE } from './guest-services';
export { POS_SYSTEM_FEATURE } from './pos-system';
export { CHANNEL_MANAGER_FEATURE } from './channel-manager';
export { RATE_MANAGEMENT_FEATURE } from './rate-management';
export { FOOD_ORDERING_FEATURE } from './food-ordering';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

import { FeatureDefinition } from '../../../interfaces/feature.interface';
import { TABLE_RESERVATIONS_FEATURE } from './table-reservations';
import { MENU_MANAGEMENT_FEATURE } from './menu-management';
import { KITCHEN_DISPLAY_FEATURE } from './kitchen-display';
import { ROOM_BOOKING_FEATURE } from './room-booking';
import { HOUSEKEEPING_FEATURE } from './housekeeping';
import { GUEST_SERVICES_FEATURE } from './guest-services';
import { POS_SYSTEM_FEATURE } from './pos-system';
import { CHANNEL_MANAGER_FEATURE } from './channel-manager';
import { RATE_MANAGEMENT_FEATURE } from './rate-management';
import { FOOD_ORDERING_FEATURE } from './food-ordering';

// ─────────────────────────────────────────────────────────────
// ALL HOSPITALITY FEATURES
// ─────────────────────────────────────────────────────────────

/**
 * All hospitality features collection (10 features)
 */
export const HOSPITALITY_FEATURES: FeatureDefinition[] = [
  TABLE_RESERVATIONS_FEATURE,
  MENU_MANAGEMENT_FEATURE,
  KITCHEN_DISPLAY_FEATURE,
  ROOM_BOOKING_FEATURE,
  HOUSEKEEPING_FEATURE,
  GUEST_SERVICES_FEATURE,
  POS_SYSTEM_FEATURE,
  CHANNEL_MANAGER_FEATURE,
  RATE_MANAGEMENT_FEATURE,
  FOOD_ORDERING_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// FEATURE GROUPINGS
// ─────────────────────────────────────────────────────────────

/**
 * Restaurant-focused features
 */
export const RESTAURANT_FEATURES: FeatureDefinition[] = [
  TABLE_RESERVATIONS_FEATURE,
  MENU_MANAGEMENT_FEATURE,
  KITCHEN_DISPLAY_FEATURE,
  POS_SYSTEM_FEATURE,
  FOOD_ORDERING_FEATURE,
];

/**
 * Hotel-focused features
 */
export const HOTEL_FEATURES: FeatureDefinition[] = [
  ROOM_BOOKING_FEATURE,
  HOUSEKEEPING_FEATURE,
  GUEST_SERVICES_FEATURE,
  CHANNEL_MANAGER_FEATURE,
  RATE_MANAGEMENT_FEATURE,
];

/**
 * Features for combined restaurant + hotel operations
 */
export const RESORT_FEATURES: FeatureDefinition[] = [
  ...RESTAURANT_FEATURES,
  ...HOTEL_FEATURES,
];

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get hospitality features for a specific app type
 */
export function getHospitalityFeaturesForAppType(appType: string): FeatureDefinition[] {
  return HOSPITALITY_FEATURES.filter(f => f.includedInAppTypes.includes(appType));
}

/**
 * Get hospitality feature by ID
 */
export function getHospitalityFeatureById(id: string): FeatureDefinition | undefined {
  return HOSPITALITY_FEATURES.find(f => f.id === id);
}
