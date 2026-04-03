/**
 * Features Registry - Master Index
 *
 * Consolidates all feature definitions for the App Builder.
 * 130+ features organized by category including industry-specific features.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

// ─────────────────────────────────────────────────────────────
// CORE FEATURES
// ─────────────────────────────────────────────────────────────
export { USER_AUTH_FEATURE } from './user-auth';
export { LANDING_PAGE_FEATURE } from './landing-page';
export { NOTIFICATIONS_FEATURE } from './notifications';
export { ANALYTICS_FEATURE } from './analytics';
export { DASHBOARD_FEATURE } from './dashboard';
export { FILE_UPLOAD_FEATURE } from './file-upload';
export { SETTINGS_FEATURE } from './settings';
export { SEARCH_FEATURE } from './search';

// ─────────────────────────────────────────────────────────────
// COMMERCE FEATURES
// ─────────────────────────────────────────────────────────────
export { PRODUCT_CATALOG_FEATURE } from './product-catalog';
export { SHOPPING_CART_FEATURE } from './shopping-cart';
export { CHECKOUT_FEATURE } from './checkout';
export { PAYMENTS_FEATURE } from './payments';
export { INVOICING_FEATURE } from './invoicing';
export { INVENTORY_FEATURE } from './inventory';
export { ORDERS_FEATURE } from './orders';
export { DISCOUNTS_FEATURE } from './discounts';
export { REVIEWS_FEATURE } from './reviews';
export { SHIPPING_FEATURE } from './shipping';
export { WISHLIST_FEATURE } from './wishlist';
export { SUBSCRIPTIONS_FEATURE } from './subscriptions';

// ─────────────────────────────────────────────────────────────
// BOOKING FEATURES
// ─────────────────────────────────────────────────────────────
export { TIME_TRACKING_FEATURE } from './time-tracking';
export { APPOINTMENTS_FEATURE } from './appointments';
export { RESERVATIONS_FEATURE } from './reservations';
export { CALENDAR_FEATURE } from './calendar';
export { AVAILABILITY_FEATURE } from './availability';
export { SCHEDULING_FEATURE } from './scheduling';
export { WAITLIST_FEATURE } from './waitlist';
export { REMINDERS_FEATURE } from './reminders';
export { CHECK_IN_FEATURE } from './check-in';

// ─────────────────────────────────────────────────────────────
// SOCIAL FEATURES
// ─────────────────────────────────────────────────────────────
export { SOCIAL_FEED_FEATURE } from './social-feed';

// ─────────────────────────────────────────────────────────────
// CONTENT FEATURES
// ─────────────────────────────────────────────────────────────
export { BLOG_FEATURE } from './blog';
export { CMS_FEATURE } from './cms';
export { GALLERY_FEATURE } from './gallery';
export { DOCUMENTS_FEATURE } from './documents';
export { MEDIA_FEATURE } from './media';
export { COMMENTS_FEATURE } from './comments';
export { TAGS_FEATURE } from './tags';
export { CATEGORIES_FEATURE } from './categories';

// ─────────────────────────────────────────────────────────────
// COMMUNICATION FEATURES
// ─────────────────────────────────────────────────────────────
export { MESSAGING_FEATURE } from './messaging';
export { CHAT_FEATURE } from './chat';
export { EMAIL_FEATURE } from './email';
export { ANNOUNCEMENTS_FEATURE } from './announcements';
export { FEEDBACK_FEATURE } from './feedback';
export { SUPPORT_TICKETS_FEATURE } from './support-tickets';

// ─────────────────────────────────────────────────────────────
// BUSINESS FEATURES
// ─────────────────────────────────────────────────────────────
export { CRM_FEATURE } from './crm';
export { REPORTING_FEATURE } from './reporting';
export { TEAM_MANAGEMENT_FEATURE } from './team-management';
export { WORKFLOW_FEATURE } from './workflow';
export { TASKS_FEATURE } from './tasks';
export { PROJECTS_FEATURE } from './projects';
export { CLIENTS_FEATURE } from './clients';
export { CONTRACTS_FEATURE } from './contracts';

// ─────────────────────────────────────────────────────────────
// HOSPITALITY FEATURES
// ─────────────────────────────────────────────────────────────
export { TABLE_RESERVATIONS_FEATURE } from './hospitality/table-reservations';
export { MENU_MANAGEMENT_FEATURE } from './hospitality/menu-management';
export { KITCHEN_DISPLAY_FEATURE } from './hospitality/kitchen-display';
export { ROOM_BOOKING_FEATURE } from './hospitality/room-booking';
export { HOUSEKEEPING_FEATURE } from './hospitality/housekeeping';
export { GUEST_SERVICES_FEATURE } from './hospitality/guest-services';
export { POS_SYSTEM_FEATURE } from './hospitality/pos-system';
export { CHANNEL_MANAGER_FEATURE } from './hospitality/channel-manager';
export { RATE_MANAGEMENT_FEATURE } from './hospitality/rate-management';
export { FOOD_ORDERING_FEATURE } from './hospitality/food-ordering';
export { HOSPITALITY_FEATURES } from './hospitality';

// ─────────────────────────────────────────────────────────────
// FITNESS FEATURES
// ─────────────────────────────────────────────────────────────
export { CLASS_SCHEDULING_FEATURE } from './fitness/class-scheduling';
export { MEMBERSHIP_PLANS_FEATURE } from './fitness/membership-plans';
export { WORKOUT_TRACKING_FEATURE } from './fitness/workout-tracking';
export { TRAINER_BOOKING_FEATURE } from './fitness/trainer-booking';
export { BODY_MEASUREMENTS_FEATURE } from './fitness/body-measurements';
export { NUTRITION_TRACKING_FEATURE } from './fitness/nutrition-tracking';
export { FITNESS_CHALLENGES_FEATURE } from './fitness/fitness-challenges';
export { CLASS_PACKAGES_FEATURE } from './fitness/class-packages';
export { EQUIPMENT_BOOKING_FEATURE } from './fitness/equipment-booking';
export { GROUP_TRAINING_FEATURE } from './fitness/group-training';
export { FITNESS_FEATURES } from './fitness';

// ─────────────────────────────────────────────────────────────
// REAL ESTATE FEATURES
// ─────────────────────────────────────────────────────────────
export { PROPERTY_LISTINGS_FEATURE } from './real-estate/property-listings';
export { VIRTUAL_TOURS_FEATURE } from './real-estate/virtual-tours';
export { MLS_INTEGRATION_FEATURE } from './real-estate/mls-integration';
export { SHOWING_MANAGEMENT_FEATURE } from './real-estate/showing-management';
export { PROPERTY_VALUATION_FEATURE } from './real-estate/property-valuation';
export { LEASE_MANAGEMENT_FEATURE } from './real-estate/lease-management';
export { TENANT_SCREENING_FEATURE } from './real-estate/tenant-screening';
export { RENT_COLLECTION_FEATURE } from './real-estate/rent-collection';
export { MAINTENANCE_REQUESTS_FEATURE } from './real-estate/maintenance-requests';
export { OPEN_HOUSES_FEATURE } from './real-estate/open-houses';
export { REAL_ESTATE_FEATURES } from './real-estate';

// ─────────────────────────────────────────────────────────────
// HEALTHCARE FEATURES
// ─────────────────────────────────────────────────────────────
export { PATIENT_RECORDS_FEATURE } from './healthcare/patient-records';
export { TREATMENT_PLANS_FEATURE } from './healthcare/treatment-plans';
export { PRESCRIPTIONS_FEATURE } from './healthcare/prescriptions';
export { INSURANCE_BILLING_FEATURE } from './healthcare/insurance-billing';
export { TELEMEDICINE_FEATURE } from './healthcare/telemedicine';
export { LAB_RESULTS_FEATURE } from './healthcare/lab-results';
export { VITAL_SIGNS_FEATURE } from './healthcare/vital-signs';
export { REFERRALS_FEATURE } from './healthcare/referrals';
export { IMMUNIZATIONS_FEATURE } from './healthcare/immunizations';
export { MEDICAL_IMAGING_FEATURE } from './healthcare/medical-imaging';
export { HEALTHCARE_FEATURES } from './healthcare';

// ─────────────────────────────────────────────────────────────
// EDUCATION FEATURES
// ─────────────────────────────────────────────────────────────
export { COURSE_MANAGEMENT_FEATURE } from './education/course-management';
export { STUDENT_RECORDS_FEATURE } from './education/student-records';
export { GRADING_FEATURE } from './education/grading';
export { ASSIGNMENTS_FEATURE } from './education/assignments';
export { LMS_FEATURE } from './education/lms';
export { ATTENDANCE_FEATURE } from './education/attendance';
export { PARENT_PORTAL_FEATURE } from './education/parent-portal';
export { TRANSCRIPTS_FEATURE } from './education/transcripts';
export { CERTIFICATES_FEATURE } from './education/certificates';
export { ENROLLMENT_FEATURE } from './education/enrollment';
export { CLASS_ROSTER_FEATURE } from './education/class-roster';
export { EDUCATION_FEATURES } from './education';

// ─────────────────────────────────────────────────────────────
// LEGAL FEATURES
// ─────────────────────────────────────────────────────────────
export { CASE_MANAGEMENT_FEATURE } from './legal/case-management';
export { CLIENT_INTAKE_FEATURE } from './legal/client-intake';
export { DOCUMENT_ASSEMBLY_FEATURE } from './legal/document-assembly';
export { COURT_CALENDAR_FEATURE } from './legal/court-calendar';
export { BILLING_TIMEKEEPING_FEATURE } from './legal/billing-timekeeping';
export { CONFLICT_CHECK_FEATURE } from './legal/conflict-check';
export { MATTER_NOTES_FEATURE } from './legal/matter-notes';
export { CLIENT_PORTAL_FEATURE } from './legal/client-portal';
export { LEGAL_FEATURES } from './legal';

// ─────────────────────────────────────────────────────────────
// AUTOMOTIVE FEATURES
// ─────────────────────────────────────────────────────────────
export { VEHICLE_INVENTORY_FEATURE } from './automotive/vehicle-inventory';
export { TEST_DRIVES_FEATURE } from './automotive/test-drives';
export { VEHICLE_HISTORY_FEATURE } from './automotive/vehicle-history';
export { TRADE_IN_VALUATION_FEATURE } from './automotive/trade-in-valuation';
export { SERVICE_SCHEDULING_FEATURE } from './automotive/service-scheduling';
export { PARTS_CATALOG_FEATURE } from './automotive/parts-catalog';
export { VEHICLE_FINANCING_FEATURE } from './automotive/vehicle-financing';
export { RECALLS_TRACKING_FEATURE } from './automotive/recalls-tracking';
export { AUTOMOTIVE_FEATURES } from './automotive';

// ─────────────────────────────────────────────────────────────
// CONSTRUCTION FEATURES
// ─────────────────────────────────────────────────────────────
export { PROJECT_BIDS_FEATURE } from './construction/project-bids';
export { SUBCONTRACTOR_MGMT_FEATURE } from './construction/subcontractor-mgmt';
export { MATERIAL_TAKEOFFS_FEATURE } from './construction/material-takeoffs';
export { SITE_SAFETY_FEATURE } from './construction/site-safety';
export { DAILY_LOGS_FEATURE } from './construction/daily-logs';
export { CHANGE_ORDERS_FEATURE } from './construction/change-orders';
export { PUNCH_LISTS_FEATURE } from './construction/punch-lists';
export { EQUIPMENT_TRACKING_FEATURE } from './construction/equipment-tracking';
export { CONSTRUCTION_FEATURES } from './construction';

// ─────────────────────────────────────────────────────────────
// ENTERTAINMENT FEATURES
// ─────────────────────────────────────────────────────────────
export { TICKET_SALES_FEATURE } from './entertainment/ticket-sales';
export { VENUE_BOOKING_FEATURE } from './entertainment/venue-booking';
export { SEATING_CHARTS_FEATURE } from './entertainment/seating-charts';
export { PERFORMER_PROFILES_FEATURE } from './entertainment/performer-profiles';
export { SHOW_SCHEDULING_FEATURE } from './entertainment/show-scheduling';
export { BOX_OFFICE_FEATURE } from './entertainment/box-office';
export { SEASON_PASSES_FEATURE } from './entertainment/season-passes';
export { BACKSTAGE_ACCESS_FEATURE } from './entertainment/backstage-access';
export { ENTERTAINMENT_FEATURES } from './entertainment';

// ─────────────────────────────────────────────────────────────
// LOGISTICS FEATURES
// ─────────────────────────────────────────────────────────────
export { SHIPMENT_TRACKING_FEATURE } from './logistics/shipment-tracking';
export { ROUTE_OPTIMIZATION_FEATURE } from './logistics/route-optimization';
export { WAREHOUSE_MGMT_FEATURE } from './logistics/warehouse-mgmt';
export { FREIGHT_QUOTES_FEATURE } from './logistics/freight-quotes';
export { CARRIER_INTEGRATION_FEATURE } from './logistics/carrier-integration';
export { PROOF_OF_DELIVERY_FEATURE } from './logistics/proof-of-delivery';
export { FLEET_TRACKING_FEATURE } from './logistics/fleet-tracking';
export { CUSTOMS_DOCS_FEATURE } from './logistics/customs-docs';
export { LOGISTICS_FEATURES } from './logistics';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

// Core
import { USER_AUTH_FEATURE } from './user-auth';
import { LANDING_PAGE_FEATURE } from './landing-page';
import { NOTIFICATIONS_FEATURE } from './notifications';
import { ANALYTICS_FEATURE } from './analytics';
import { DASHBOARD_FEATURE } from './dashboard';
import { FILE_UPLOAD_FEATURE } from './file-upload';
import { SETTINGS_FEATURE } from './settings';
import { SEARCH_FEATURE } from './search';

// Commerce
import { PRODUCT_CATALOG_FEATURE } from './product-catalog';
import { SHOPPING_CART_FEATURE } from './shopping-cart';
import { CHECKOUT_FEATURE } from './checkout';
import { PAYMENTS_FEATURE } from './payments';
import { INVOICING_FEATURE } from './invoicing';
import { INVENTORY_FEATURE } from './inventory';
import { ORDERS_FEATURE } from './orders';
import { DISCOUNTS_FEATURE } from './discounts';
import { REVIEWS_FEATURE } from './reviews';
import { SHIPPING_FEATURE } from './shipping';
import { WISHLIST_FEATURE } from './wishlist';
import { SUBSCRIPTIONS_FEATURE } from './subscriptions';

// Booking
import { TIME_TRACKING_FEATURE } from './time-tracking';
import { APPOINTMENTS_FEATURE } from './appointments';
import { RESERVATIONS_FEATURE } from './reservations';
import { CALENDAR_FEATURE } from './calendar';
import { AVAILABILITY_FEATURE } from './availability';
import { SCHEDULING_FEATURE } from './scheduling';
import { WAITLIST_FEATURE } from './waitlist';
import { REMINDERS_FEATURE } from './reminders';
import { CHECK_IN_FEATURE } from './check-in';

// Social
import { SOCIAL_FEED_FEATURE } from './social-feed';

// Content
import { BLOG_FEATURE } from './blog';
import { CMS_FEATURE } from './cms';
import { GALLERY_FEATURE } from './gallery';
import { DOCUMENTS_FEATURE } from './documents';
import { MEDIA_FEATURE } from './media';
import { COMMENTS_FEATURE } from './comments';
import { TAGS_FEATURE } from './tags';
import { CATEGORIES_FEATURE } from './categories';

// Communication
import { MESSAGING_FEATURE } from './messaging';
import { CHAT_FEATURE } from './chat';
import { EMAIL_FEATURE } from './email';
import { ANNOUNCEMENTS_FEATURE } from './announcements';
import { FEEDBACK_FEATURE } from './feedback';
import { SUPPORT_TICKETS_FEATURE } from './support-tickets';

// Business
import { CRM_FEATURE } from './crm';
import { REPORTING_FEATURE } from './reporting';
import { TEAM_MANAGEMENT_FEATURE } from './team-management';
import { WORKFLOW_FEATURE } from './workflow';
import { TASKS_FEATURE } from './tasks';
import { PROJECTS_FEATURE } from './projects';
import { CLIENTS_FEATURE } from './clients';
import { CONTRACTS_FEATURE } from './contracts';

// Hospitality
import { TABLE_RESERVATIONS_FEATURE } from './hospitality/table-reservations';
import { MENU_MANAGEMENT_FEATURE } from './hospitality/menu-management';
import { KITCHEN_DISPLAY_FEATURE } from './hospitality/kitchen-display';
import { ROOM_BOOKING_FEATURE } from './hospitality/room-booking';
import { HOUSEKEEPING_FEATURE } from './hospitality/housekeeping';
import { GUEST_SERVICES_FEATURE } from './hospitality/guest-services';
import { POS_SYSTEM_FEATURE } from './hospitality/pos-system';
import { CHANNEL_MANAGER_FEATURE } from './hospitality/channel-manager';
import { RATE_MANAGEMENT_FEATURE } from './hospitality/rate-management';
import { FOOD_ORDERING_FEATURE } from './hospitality/food-ordering';

// Fitness
import { CLASS_SCHEDULING_FEATURE } from './fitness/class-scheduling';
import { MEMBERSHIP_PLANS_FEATURE } from './fitness/membership-plans';
import { WORKOUT_TRACKING_FEATURE } from './fitness/workout-tracking';
import { TRAINER_BOOKING_FEATURE } from './fitness/trainer-booking';
import { BODY_MEASUREMENTS_FEATURE } from './fitness/body-measurements';
import { NUTRITION_TRACKING_FEATURE } from './fitness/nutrition-tracking';
import { FITNESS_CHALLENGES_FEATURE } from './fitness/fitness-challenges';
import { CLASS_PACKAGES_FEATURE } from './fitness/class-packages';
import { EQUIPMENT_BOOKING_FEATURE } from './fitness/equipment-booking';
import { GROUP_TRAINING_FEATURE } from './fitness/group-training';

// Real Estate
import { PROPERTY_LISTINGS_FEATURE } from './real-estate/property-listings';
import { VIRTUAL_TOURS_FEATURE } from './real-estate/virtual-tours';
import { MLS_INTEGRATION_FEATURE } from './real-estate/mls-integration';
import { SHOWING_MANAGEMENT_FEATURE } from './real-estate/showing-management';
import { PROPERTY_VALUATION_FEATURE } from './real-estate/property-valuation';
import { LEASE_MANAGEMENT_FEATURE } from './real-estate/lease-management';
import { TENANT_SCREENING_FEATURE } from './real-estate/tenant-screening';
import { RENT_COLLECTION_FEATURE } from './real-estate/rent-collection';
import { MAINTENANCE_REQUESTS_FEATURE } from './real-estate/maintenance-requests';
import { OPEN_HOUSES_FEATURE } from './real-estate/open-houses';

// Healthcare
import { PATIENT_RECORDS_FEATURE } from './healthcare/patient-records';
import { TREATMENT_PLANS_FEATURE } from './healthcare/treatment-plans';
import { PRESCRIPTIONS_FEATURE } from './healthcare/prescriptions';
import { INSURANCE_BILLING_FEATURE } from './healthcare/insurance-billing';
import { TELEMEDICINE_FEATURE } from './healthcare/telemedicine';
import { LAB_RESULTS_FEATURE } from './healthcare/lab-results';
import { VITAL_SIGNS_FEATURE } from './healthcare/vital-signs';
import { REFERRALS_FEATURE } from './healthcare/referrals';
import { IMMUNIZATIONS_FEATURE } from './healthcare/immunizations';
import { MEDICAL_IMAGING_FEATURE } from './healthcare/medical-imaging';

// Education
import { COURSE_MANAGEMENT_FEATURE } from './education/course-management';
import { STUDENT_RECORDS_FEATURE } from './education/student-records';
import { GRADING_FEATURE } from './education/grading';
import { ASSIGNMENTS_FEATURE } from './education/assignments';
import { LMS_FEATURE } from './education/lms';
import { ATTENDANCE_FEATURE } from './education/attendance';
import { PARENT_PORTAL_FEATURE } from './education/parent-portal';
import { TRANSCRIPTS_FEATURE } from './education/transcripts';
import { CERTIFICATES_FEATURE } from './education/certificates';
import { ENROLLMENT_FEATURE } from './education/enrollment';
import { CLASS_ROSTER_FEATURE } from './education/class-roster';

// Legal
import { CASE_MANAGEMENT_FEATURE } from './legal/case-management';
import { CLIENT_INTAKE_FEATURE } from './legal/client-intake';
import { DOCUMENT_ASSEMBLY_FEATURE } from './legal/document-assembly';
import { COURT_CALENDAR_FEATURE } from './legal/court-calendar';
import { BILLING_TIMEKEEPING_FEATURE } from './legal/billing-timekeeping';
import { CONFLICT_CHECK_FEATURE } from './legal/conflict-check';
import { MATTER_NOTES_FEATURE } from './legal/matter-notes';
import { CLIENT_PORTAL_FEATURE } from './legal/client-portal';

// Automotive
import { VEHICLE_INVENTORY_FEATURE } from './automotive/vehicle-inventory';
import { TEST_DRIVES_FEATURE } from './automotive/test-drives';
import { VEHICLE_HISTORY_FEATURE } from './automotive/vehicle-history';
import { TRADE_IN_VALUATION_FEATURE } from './automotive/trade-in-valuation';
import { SERVICE_SCHEDULING_FEATURE } from './automotive/service-scheduling';
import { PARTS_CATALOG_FEATURE } from './automotive/parts-catalog';
import { VEHICLE_FINANCING_FEATURE } from './automotive/vehicle-financing';
import { RECALLS_TRACKING_FEATURE } from './automotive/recalls-tracking';

// Construction
import { PROJECT_BIDS_FEATURE } from './construction/project-bids';
import { SUBCONTRACTOR_MGMT_FEATURE } from './construction/subcontractor-mgmt';
import { MATERIAL_TAKEOFFS_FEATURE } from './construction/material-takeoffs';
import { SITE_SAFETY_FEATURE } from './construction/site-safety';
import { DAILY_LOGS_FEATURE } from './construction/daily-logs';
import { CHANGE_ORDERS_FEATURE } from './construction/change-orders';
import { PUNCH_LISTS_FEATURE } from './construction/punch-lists';
import { EQUIPMENT_TRACKING_FEATURE } from './construction/equipment-tracking';

// Entertainment
import { TICKET_SALES_FEATURE } from './entertainment/ticket-sales';
import { VENUE_BOOKING_FEATURE } from './entertainment/venue-booking';
import { SEATING_CHARTS_FEATURE } from './entertainment/seating-charts';
import { PERFORMER_PROFILES_FEATURE } from './entertainment/performer-profiles';
import { SHOW_SCHEDULING_FEATURE } from './entertainment/show-scheduling';
import { BOX_OFFICE_FEATURE } from './entertainment/box-office';
import { SEASON_PASSES_FEATURE } from './entertainment/season-passes';
import { BACKSTAGE_ACCESS_FEATURE } from './entertainment/backstage-access';

// Logistics
import { SHIPMENT_TRACKING_FEATURE } from './logistics/shipment-tracking';
import { ROUTE_OPTIMIZATION_FEATURE } from './logistics/route-optimization';
import { WAREHOUSE_MGMT_FEATURE } from './logistics/warehouse-mgmt';
import { FREIGHT_QUOTES_FEATURE } from './logistics/freight-quotes';
import { CARRIER_INTEGRATION_FEATURE } from './logistics/carrier-integration';
import { PROOF_OF_DELIVERY_FEATURE } from './logistics/proof-of-delivery';
import { FLEET_TRACKING_FEATURE } from './logistics/fleet-tracking';
import { CUSTOMS_DOCS_FEATURE } from './logistics/customs-docs';

// ─────────────────────────────────────────────────────────────
// ALL FEATURES REGISTRY
// ─────────────────────────────────────────────────────────────

/**
 * All features registry - 130+ features across all industries
 */
export const ALL_FEATURES: FeatureDefinition[] = [
  // Core (8)
  USER_AUTH_FEATURE,
  LANDING_PAGE_FEATURE,
  NOTIFICATIONS_FEATURE,
  ANALYTICS_FEATURE,
  DASHBOARD_FEATURE,
  FILE_UPLOAD_FEATURE,
  SETTINGS_FEATURE,
  SEARCH_FEATURE,

  // Commerce (12)
  PRODUCT_CATALOG_FEATURE,
  SHOPPING_CART_FEATURE,
  CHECKOUT_FEATURE,
  PAYMENTS_FEATURE,
  INVOICING_FEATURE,
  INVENTORY_FEATURE,
  ORDERS_FEATURE,
  DISCOUNTS_FEATURE,
  REVIEWS_FEATURE,
  SHIPPING_FEATURE,
  WISHLIST_FEATURE,
  SUBSCRIPTIONS_FEATURE,

  // Booking (9)
  TIME_TRACKING_FEATURE,
  APPOINTMENTS_FEATURE,
  RESERVATIONS_FEATURE,
  CALENDAR_FEATURE,
  AVAILABILITY_FEATURE,
  SCHEDULING_FEATURE,
  WAITLIST_FEATURE,
  REMINDERS_FEATURE,
  CHECK_IN_FEATURE,

  // Social (1)
  SOCIAL_FEED_FEATURE,

  // Content (8)
  BLOG_FEATURE,
  CMS_FEATURE,
  GALLERY_FEATURE,
  DOCUMENTS_FEATURE,
  MEDIA_FEATURE,
  COMMENTS_FEATURE,
  TAGS_FEATURE,
  CATEGORIES_FEATURE,

  // Communication (6)
  MESSAGING_FEATURE,
  CHAT_FEATURE,
  EMAIL_FEATURE,
  ANNOUNCEMENTS_FEATURE,
  FEEDBACK_FEATURE,
  SUPPORT_TICKETS_FEATURE,

  // Business (8)
  CRM_FEATURE,
  REPORTING_FEATURE,
  TEAM_MANAGEMENT_FEATURE,
  WORKFLOW_FEATURE,
  TASKS_FEATURE,
  PROJECTS_FEATURE,
  CLIENTS_FEATURE,
  CONTRACTS_FEATURE,

  // Hospitality (10)
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

  // Fitness (10)
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

  // Real Estate (10)
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

  // Healthcare (10)
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

  // Education (11)
  COURSE_MANAGEMENT_FEATURE,
  STUDENT_RECORDS_FEATURE,
  GRADING_FEATURE,
  ASSIGNMENTS_FEATURE,
  LMS_FEATURE,
  ATTENDANCE_FEATURE,
  PARENT_PORTAL_FEATURE,
  TRANSCRIPTS_FEATURE,
  CERTIFICATES_FEATURE,
  ENROLLMENT_FEATURE,
  CLASS_ROSTER_FEATURE,

  // Legal (8)
  CASE_MANAGEMENT_FEATURE,
  CLIENT_INTAKE_FEATURE,
  DOCUMENT_ASSEMBLY_FEATURE,
  COURT_CALENDAR_FEATURE,
  BILLING_TIMEKEEPING_FEATURE,
  CONFLICT_CHECK_FEATURE,
  MATTER_NOTES_FEATURE,
  CLIENT_PORTAL_FEATURE,

  // Automotive (8)
  VEHICLE_INVENTORY_FEATURE,
  TEST_DRIVES_FEATURE,
  VEHICLE_HISTORY_FEATURE,
  TRADE_IN_VALUATION_FEATURE,
  SERVICE_SCHEDULING_FEATURE,
  PARTS_CATALOG_FEATURE,
  VEHICLE_FINANCING_FEATURE,
  RECALLS_TRACKING_FEATURE,

  // Construction (8)
  PROJECT_BIDS_FEATURE,
  SUBCONTRACTOR_MGMT_FEATURE,
  MATERIAL_TAKEOFFS_FEATURE,
  SITE_SAFETY_FEATURE,
  DAILY_LOGS_FEATURE,
  CHANGE_ORDERS_FEATURE,
  PUNCH_LISTS_FEATURE,
  EQUIPMENT_TRACKING_FEATURE,

  // Entertainment (8)
  TICKET_SALES_FEATURE,
  VENUE_BOOKING_FEATURE,
  SEATING_CHARTS_FEATURE,
  PERFORMER_PROFILES_FEATURE,
  SHOW_SCHEDULING_FEATURE,
  BOX_OFFICE_FEATURE,
  SEASON_PASSES_FEATURE,
  BACKSTAGE_ACCESS_FEATURE,

  // Logistics (8)
  SHIPMENT_TRACKING_FEATURE,
  ROUTE_OPTIMIZATION_FEATURE,
  WAREHOUSE_MGMT_FEATURE,
  FREIGHT_QUOTES_FEATURE,
  CARRIER_INTEGRATION_FEATURE,
  PROOF_OF_DELIVERY_FEATURE,
  FLEET_TRACKING_FEATURE,
  CUSTOMS_DOCS_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// LOOKUP UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Features map by ID for quick lookup
 */
export const FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  ALL_FEATURES.map(f => [f.id, f])
);

/**
 * Features grouped by category
 */
export const FEATURES_BY_CATEGORY: Record<string, FeatureDefinition[]> = {
  core: ALL_FEATURES.filter(f => f.category === 'core'),
  security: ALL_FEATURES.filter(f => f.category === 'security'),
  social: ALL_FEATURES.filter(f => f.category === 'social'),
  commerce: ALL_FEATURES.filter(f => f.category === 'commerce'),
  booking: ALL_FEATURES.filter(f => f.category === 'booking'),
  content: ALL_FEATURES.filter(f => f.category === 'content'),
  communication: ALL_FEATURES.filter(f => f.category === 'communication'),
  business: ALL_FEATURES.filter(f => f.category === 'business'),
  utility: ALL_FEATURES.filter(f => f.category === 'utility'),
  analytics: ALL_FEATURES.filter(f => f.category === 'analytics'),
  hospitality: ALL_FEATURES.filter(f => f.category === 'hospitality'),
  fitness: ALL_FEATURES.filter(f => f.category === 'fitness'),
  'real-estate': ALL_FEATURES.filter(f => f.category === 'real-estate'),
  healthcare: ALL_FEATURES.filter(f => f.category === 'healthcare'),
  education: ALL_FEATURES.filter(f => f.category === 'education'),
  legal: ALL_FEATURES.filter(f => f.category === 'legal'),
  automotive: ALL_FEATURES.filter(f => f.category === 'automotive'),
  construction: ALL_FEATURES.filter(f => f.category === 'construction'),
  entertainment: ALL_FEATURES.filter(f => f.category === 'entertainment'),
  logistics: ALL_FEATURES.filter(f => f.category === 'logistics'),
};

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get feature by ID
 */
export function getFeatureById(id: string): FeatureDefinition | undefined {
  return FEATURES_BY_ID.get(id);
}

/**
 * Get features for an app type
 */
export function getFeaturesForAppType(appTypeId: string): FeatureDefinition[] {
  return ALL_FEATURES.filter(f => f.includedInAppTypes.includes(appTypeId));
}

/**
 * Get features by keywords
 */
export function getFeaturesByKeyword(keyword: string): FeatureDefinition[] {
  const kw = keyword.toLowerCase();
  return ALL_FEATURES.filter(f =>
    f.activationKeywords.some(k => k.toLowerCase().includes(kw))
  );
}

/**
 * Get default features (enabled by default)
 */
export function getDefaultFeatures(appTypeId: string): FeatureDefinition[] {
  return ALL_FEATURES.filter(
    f => f.includedInAppTypes.includes(appTypeId) && f.enabledByDefault
  );
}

/**
 * Get optional features for an app type
 */
export function getOptionalFeatures(appTypeId: string): FeatureDefinition[] {
  return ALL_FEATURES.filter(
    f => f.includedInAppTypes.includes(appTypeId) && f.optional
  );
}

/**
 * Check if features are compatible
 */
export function areFeaturesCompatible(featureIds: string[]): boolean {
  for (const id of featureIds) {
    const feature = FEATURES_BY_ID.get(id);
    if (!feature) continue;

    for (const conflict of feature.conflicts || []) {
      if (featureIds.includes(conflict)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get feature dependencies
 */
export function getFeatureDependencies(featureId: string): FeatureDefinition[] {
  const feature = FEATURES_BY_ID.get(featureId);
  if (!feature) return [];

  return (feature.dependencies || [])
    .map(id => FEATURES_BY_ID.get(id))
    .filter((f): f is FeatureDefinition => f !== undefined);
}

/**
 * Get all industry-specific features
 */
export function getIndustryFeatures(): FeatureDefinition[] {
  const industryCategories = [
    'hospitality', 'fitness', 'real-estate', 'healthcare',
    'education', 'legal', 'automotive', 'construction',
    'entertainment', 'logistics'
  ];
  return ALL_FEATURES.filter(f => industryCategories.includes(f.category));
}

/**
 * Get features count by category
 */
export function getFeatureCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [category, features] of Object.entries(FEATURES_BY_CATEGORY)) {
    counts[category] = features.length;
  }
  return counts;
}
