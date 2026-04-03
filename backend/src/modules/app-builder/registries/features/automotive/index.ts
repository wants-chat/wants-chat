/**
 * Automotive Features Registry
 *
 * Consolidates all automotive industry feature definitions.
 * 8 features for car dealerships, auto service centers, and parts stores.
 */

// ─────────────────────────────────────────────────────────────
// FEATURE EXPORTS
// ─────────────────────────────────────────────────────────────

export { VEHICLE_INVENTORY_FEATURE } from './vehicle-inventory';
export { TEST_DRIVES_FEATURE } from './test-drives';
export { VEHICLE_HISTORY_FEATURE } from './vehicle-history';
export { TRADE_IN_VALUATION_FEATURE } from './trade-in-valuation';
export { SERVICE_SCHEDULING_FEATURE } from './service-scheduling';
export { PARTS_CATALOG_FEATURE } from './parts-catalog';
export { VEHICLE_FINANCING_FEATURE } from './vehicle-financing';
export { RECALLS_TRACKING_FEATURE } from './recalls-tracking';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

import { VEHICLE_INVENTORY_FEATURE } from './vehicle-inventory';
import { TEST_DRIVES_FEATURE } from './test-drives';
import { VEHICLE_HISTORY_FEATURE } from './vehicle-history';
import { TRADE_IN_VALUATION_FEATURE } from './trade-in-valuation';
import { SERVICE_SCHEDULING_FEATURE } from './service-scheduling';
import { PARTS_CATALOG_FEATURE } from './parts-catalog';
import { VEHICLE_FINANCING_FEATURE } from './vehicle-financing';
import { RECALLS_TRACKING_FEATURE } from './recalls-tracking';

import { FeatureDefinition } from '../../../interfaces/feature.interface';

// ─────────────────────────────────────────────────────────────
// ALL AUTOMOTIVE FEATURES
// ─────────────────────────────────────────────────────────────

/**
 * All automotive features (8 features)
 */
export const AUTOMOTIVE_FEATURES: FeatureDefinition[] = [
  VEHICLE_INVENTORY_FEATURE,
  TEST_DRIVES_FEATURE,
  VEHICLE_HISTORY_FEATURE,
  TRADE_IN_VALUATION_FEATURE,
  SERVICE_SCHEDULING_FEATURE,
  PARTS_CATALOG_FEATURE,
  VEHICLE_FINANCING_FEATURE,
  RECALLS_TRACKING_FEATURE,
];

/**
 * Automotive features map by ID
 */
export const AUTOMOTIVE_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  AUTOMOTIVE_FEATURES.map(f => [f.id, f])
);

/**
 * Get automotive feature by ID
 */
export function getAutomotiveFeatureById(id: string): FeatureDefinition | undefined {
  return AUTOMOTIVE_FEATURES_BY_ID.get(id);
}

/**
 * Get automotive features for a specific app type
 */
export function getAutomotiveFeaturesForAppType(appTypeId: string): FeatureDefinition[] {
  return AUTOMOTIVE_FEATURES.filter(f => f.includedInAppTypes.includes(appTypeId));
}

/**
 * Get default automotive features (enabled by default)
 */
export function getDefaultAutomotiveFeatures(appTypeId: string): FeatureDefinition[] {
  return AUTOMOTIVE_FEATURES.filter(
    f => f.includedInAppTypes.includes(appTypeId) && f.enabledByDefault
  );
}
