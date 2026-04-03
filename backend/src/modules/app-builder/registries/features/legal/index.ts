/**
 * Legal Features Registry
 *
 * Complete set of legal industry features for law firm applications.
 * Includes case management, billing, client portal, and more.
 */

// Feature exports
export { CASE_MANAGEMENT_FEATURE } from './case-management';
export { CLIENT_INTAKE_FEATURE } from './client-intake';
export { DOCUMENT_ASSEMBLY_FEATURE } from './document-assembly';
export { COURT_CALENDAR_FEATURE } from './court-calendar';
export { BILLING_TIMEKEEPING_FEATURE } from './billing-timekeeping';
export { CONFLICT_CHECK_FEATURE } from './conflict-check';
export { MATTER_NOTES_FEATURE } from './matter-notes';
export { CLIENT_PORTAL_FEATURE } from './client-portal';

// Imports for collection
import { CASE_MANAGEMENT_FEATURE } from './case-management';
import { CLIENT_INTAKE_FEATURE } from './client-intake';
import { DOCUMENT_ASSEMBLY_FEATURE } from './document-assembly';
import { COURT_CALENDAR_FEATURE } from './court-calendar';
import { BILLING_TIMEKEEPING_FEATURE } from './billing-timekeeping';
import { CONFLICT_CHECK_FEATURE } from './conflict-check';
import { MATTER_NOTES_FEATURE } from './matter-notes';
import { CLIENT_PORTAL_FEATURE } from './client-portal';

import { FeatureDefinition } from '../../../interfaces/feature.interface';

/**
 * All legal features (8 features)
 */
export const LEGAL_FEATURES: FeatureDefinition[] = [
  CASE_MANAGEMENT_FEATURE,
  CLIENT_INTAKE_FEATURE,
  DOCUMENT_ASSEMBLY_FEATURE,
  COURT_CALENDAR_FEATURE,
  BILLING_TIMEKEEPING_FEATURE,
  CONFLICT_CHECK_FEATURE,
  MATTER_NOTES_FEATURE,
  CLIENT_PORTAL_FEATURE,
];

/**
 * Legal features map by ID
 */
export const LEGAL_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  LEGAL_FEATURES.map(f => [f.id, f])
);

/**
 * Get all legal feature IDs
 */
export const LEGAL_FEATURE_IDS = LEGAL_FEATURES.map(f => f.id);
