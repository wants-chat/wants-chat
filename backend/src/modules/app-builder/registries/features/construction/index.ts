/**
 * Construction Features Index
 *
 * Exports all construction industry feature definitions.
 */

import { PROJECT_BIDS_FEATURE } from './project-bids';
import { SUBCONTRACTOR_MGMT_FEATURE } from './subcontractor-mgmt';
import { MATERIAL_TAKEOFFS_FEATURE } from './material-takeoffs';
import { SITE_SAFETY_FEATURE } from './site-safety';
import { DAILY_LOGS_FEATURE } from './daily-logs';
import { CHANGE_ORDERS_FEATURE } from './change-orders';
import { PUNCH_LISTS_FEATURE } from './punch-lists';
import { EQUIPMENT_TRACKING_FEATURE } from './equipment-tracking';

// Re-export all features
export {
  PROJECT_BIDS_FEATURE,
  SUBCONTRACTOR_MGMT_FEATURE,
  MATERIAL_TAKEOFFS_FEATURE,
  SITE_SAFETY_FEATURE,
  DAILY_LOGS_FEATURE,
  CHANGE_ORDERS_FEATURE,
  PUNCH_LISTS_FEATURE,
  EQUIPMENT_TRACKING_FEATURE,
};

// All construction features array
export const CONSTRUCTION_FEATURES = [
  PROJECT_BIDS_FEATURE,
  SUBCONTRACTOR_MGMT_FEATURE,
  MATERIAL_TAKEOFFS_FEATURE,
  SITE_SAFETY_FEATURE,
  DAILY_LOGS_FEATURE,
  CHANGE_ORDERS_FEATURE,
  PUNCH_LISTS_FEATURE,
  EQUIPMENT_TRACKING_FEATURE,
];
