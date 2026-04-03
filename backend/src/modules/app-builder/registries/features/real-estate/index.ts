/**
 * Real Estate Features Registry
 *
 * Comprehensive real estate industry features for property management,
 * real estate agencies, vacation rentals, and commercial real estate.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

// ─────────────────────────────────────────────────────────────
// INDIVIDUAL FEATURE EXPORTS
// ─────────────────────────────────────────────────────────────

export { PROPERTY_LISTINGS_FEATURE } from './property-listings';
export { VIRTUAL_TOURS_FEATURE } from './virtual-tours';
export { MLS_INTEGRATION_FEATURE } from './mls-integration';
export { SHOWING_MANAGEMENT_FEATURE } from './showing-management';
export { PROPERTY_VALUATION_FEATURE } from './property-valuation';
export { LEASE_MANAGEMENT_FEATURE } from './lease-management';
export { TENANT_SCREENING_FEATURE } from './tenant-screening';
export { RENT_COLLECTION_FEATURE } from './rent-collection';
export { MAINTENANCE_REQUESTS_FEATURE } from './maintenance-requests';
export { OPEN_HOUSES_FEATURE } from './open-houses';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

import { PROPERTY_LISTINGS_FEATURE } from './property-listings';
import { VIRTUAL_TOURS_FEATURE } from './virtual-tours';
import { MLS_INTEGRATION_FEATURE } from './mls-integration';
import { SHOWING_MANAGEMENT_FEATURE } from './showing-management';
import { PROPERTY_VALUATION_FEATURE } from './property-valuation';
import { LEASE_MANAGEMENT_FEATURE } from './lease-management';
import { TENANT_SCREENING_FEATURE } from './tenant-screening';
import { RENT_COLLECTION_FEATURE } from './rent-collection';
import { MAINTENANCE_REQUESTS_FEATURE } from './maintenance-requests';
import { OPEN_HOUSES_FEATURE } from './open-houses';

// ─────────────────────────────────────────────────────────────
// ALL REAL ESTATE FEATURES
// ─────────────────────────────────────────────────────────────

/**
 * All real estate features - 10 comprehensive features
 */
export const REAL_ESTATE_FEATURES: FeatureDefinition[] = [
  PROPERTY_LISTINGS_FEATURE,
  VIRTUAL_TOURS_FEATURE,
  MLS_INTEGRATION_FEATURE,
  SHOWING_MANAGEMENT_FEATURE,
  PROPERTY_VALUATION_FEATURE,
  LEASE_MANAGEMENT_FEATURE,
  TENANT_SCREENING_FEATURE,
  RENT_COLLECTION_FEATURE,
  MAINTENANCE_REQUESTS_FEATURE,
  OPEN_HOUSES_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// FEATURE GROUPINGS
// ─────────────────────────────────────────────────────────────

/**
 * Core features for real estate listings
 */
export const LISTING_FEATURES: FeatureDefinition[] = [
  PROPERTY_LISTINGS_FEATURE,
  VIRTUAL_TOURS_FEATURE,
  MLS_INTEGRATION_FEATURE,
  SHOWING_MANAGEMENT_FEATURE,
  OPEN_HOUSES_FEATURE,
];

/**
 * Property management specific features
 */
export const PROPERTY_MANAGEMENT_FEATURES: FeatureDefinition[] = [
  LEASE_MANAGEMENT_FEATURE,
  TENANT_SCREENING_FEATURE,
  RENT_COLLECTION_FEATURE,
  MAINTENANCE_REQUESTS_FEATURE,
];

/**
 * Valuation and analysis features
 */
export const VALUATION_FEATURES: FeatureDefinition[] = [
  PROPERTY_VALUATION_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// LOOKUP UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Real estate features map by ID for quick lookup
 */
export const REAL_ESTATE_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  REAL_ESTATE_FEATURES.map(f => [f.id, f])
);

/**
 * Get real estate feature by ID
 */
export function getRealEstateFeatureById(id: string): FeatureDefinition | undefined {
  return REAL_ESTATE_FEATURES_BY_ID.get(id);
}

/**
 * Get real estate features for a specific app type
 */
export function getRealEstateFeaturesForAppType(appTypeId: string): FeatureDefinition[] {
  return REAL_ESTATE_FEATURES.filter(f => f.includedInAppTypes.includes(appTypeId));
}

/**
 * Get default real estate features (enabled by default)
 */
export function getDefaultRealEstateFeatures(appTypeId: string): FeatureDefinition[] {
  return REAL_ESTATE_FEATURES.filter(
    f => f.includedInAppTypes.includes(appTypeId) && f.enabledByDefault
  );
}

/**
 * Get optional real estate features for an app type
 */
export function getOptionalRealEstateFeatures(appTypeId: string): FeatureDefinition[] {
  return REAL_ESTATE_FEATURES.filter(
    f => f.includedInAppTypes.includes(appTypeId) && f.optional
  );
}
