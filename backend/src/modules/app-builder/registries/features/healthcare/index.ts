/**
 * Healthcare Features Registry
 *
 * Comprehensive healthcare industry features for medical practices,
 * hospitals, clinics, and telehealth applications.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

// ─────────────────────────────────────────────────────────────
// HEALTHCARE FEATURE EXPORTS
// ─────────────────────────────────────────────────────────────

export { PATIENT_RECORDS_FEATURE } from './patient-records';
export { TREATMENT_PLANS_FEATURE } from './treatment-plans';
export { PRESCRIPTIONS_FEATURE } from './prescriptions';
export { INSURANCE_BILLING_FEATURE } from './insurance-billing';
export { TELEMEDICINE_FEATURE } from './telemedicine';
export { LAB_RESULTS_FEATURE } from './lab-results';
export { VITAL_SIGNS_FEATURE } from './vital-signs';
export { REFERRALS_FEATURE } from './referrals';
export { IMMUNIZATIONS_FEATURE } from './immunizations';
export { MEDICAL_IMAGING_FEATURE } from './medical-imaging';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

import { PATIENT_RECORDS_FEATURE } from './patient-records';
import { TREATMENT_PLANS_FEATURE } from './treatment-plans';
import { PRESCRIPTIONS_FEATURE } from './prescriptions';
import { INSURANCE_BILLING_FEATURE } from './insurance-billing';
import { TELEMEDICINE_FEATURE } from './telemedicine';
import { LAB_RESULTS_FEATURE } from './lab-results';
import { VITAL_SIGNS_FEATURE } from './vital-signs';
import { REFERRALS_FEATURE } from './referrals';
import { IMMUNIZATIONS_FEATURE } from './immunizations';
import { MEDICAL_IMAGING_FEATURE } from './medical-imaging';

// ─────────────────────────────────────────────────────────────
// HEALTHCARE FEATURES COLLECTION
// ─────────────────────────────────────────────────────────────

/**
 * All healthcare features (10 features)
 */
export const HEALTHCARE_FEATURES: FeatureDefinition[] = [
  PATIENT_RECORDS_FEATURE,
  TREATMENT_PLANS_FEATURE,
  PRESCRIPTIONS_FEATURE,
  INSURANCE_BILLING_FEATURE,
  TELEMEDICINE_FEATURE,
  LAB_RESULTS_FEATURE,
  VITAL_SIGNS_FEATURE,
  REFERRALS_FEATURE,
  IMMUNIZATIONS_FEATURE,
  MEDICAL_IMAGING_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// LOOKUP UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Healthcare features map by ID for quick lookup
 */
export const HEALTHCARE_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  HEALTHCARE_FEATURES.map(f => [f.id, f])
);

/**
 * Get healthcare feature by ID
 */
export function getHealthcareFeatureById(id: string): FeatureDefinition | undefined {
  return HEALTHCARE_FEATURES_BY_ID.get(id);
}

/**
 * Get healthcare features for a specific app type
 */
export function getHealthcareFeaturesForAppType(appTypeId: string): FeatureDefinition[] {
  return HEALTHCARE_FEATURES.filter(f => f.includedInAppTypes.includes(appTypeId));
}

/**
 * Get healthcare features by keyword
 */
export function getHealthcareFeaturesByKeyword(keyword: string): FeatureDefinition[] {
  const kw = keyword.toLowerCase();
  return HEALTHCARE_FEATURES.filter(f =>
    f.activationKeywords.some(k => k.toLowerCase().includes(kw))
  );
}

/**
 * Get core healthcare features (enabled by default)
 */
export function getCoreHealthcareFeatures(): FeatureDefinition[] {
  return HEALTHCARE_FEATURES.filter(f => f.enabledByDefault);
}

/**
 * Get optional healthcare features
 */
export function getOptionalHealthcareFeatures(): FeatureDefinition[] {
  return HEALTHCARE_FEATURES.filter(f => f.optional);
}
