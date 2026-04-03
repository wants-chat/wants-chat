/**
 * Entertainment Features Index
 *
 * Exports all entertainment industry features for ticketing,
 * venue management, performer profiles, and VIP experiences.
 */

import { TICKET_SALES_FEATURE } from './ticket-sales';
import { VENUE_BOOKING_FEATURE } from './venue-booking';
import { SEATING_CHARTS_FEATURE } from './seating-charts';
import { PERFORMER_PROFILES_FEATURE } from './performer-profiles';
import { SHOW_SCHEDULING_FEATURE } from './show-scheduling';
import { BOX_OFFICE_FEATURE } from './box-office';
import { SEASON_PASSES_FEATURE } from './season-passes';
import { BACKSTAGE_ACCESS_FEATURE } from './backstage-access';

// Re-export individual features
export {
  TICKET_SALES_FEATURE,
  VENUE_BOOKING_FEATURE,
  SEATING_CHARTS_FEATURE,
  PERFORMER_PROFILES_FEATURE,
  SHOW_SCHEDULING_FEATURE,
  BOX_OFFICE_FEATURE,
  SEASON_PASSES_FEATURE,
  BACKSTAGE_ACCESS_FEATURE,
};

// Feature array for batch registration
export const ENTERTAINMENT_FEATURES = [
  TICKET_SALES_FEATURE,
  VENUE_BOOKING_FEATURE,
  SEATING_CHARTS_FEATURE,
  PERFORMER_PROFILES_FEATURE,
  SHOW_SCHEDULING_FEATURE,
  BOX_OFFICE_FEATURE,
  SEASON_PASSES_FEATURE,
  BACKSTAGE_ACCESS_FEATURE,
];
