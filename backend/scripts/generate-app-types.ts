/**
 * App Type Generator Script
 *
 * Generates comprehensive app type definitions for all missing app types.
 * Uses existing features and components from the registry.
 *
 * Run: npx ts-node scripts/generate-app-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────
// EXISTING FEATURES (130+)
// ─────────────────────────────────────────────────────────────
const EXISTING_FEATURES = {
  // Core
  core: ['user-auth', 'notifications', 'analytics', 'dashboard', 'file-upload', 'settings', 'search'],

  // Commerce
  commerce: ['product-catalog', 'shopping-cart', 'checkout', 'payments', 'invoicing', 'inventory', 'orders', 'discounts', 'reviews', 'shipping', 'wishlist', 'subscriptions'],

  // Booking
  booking: ['time-tracking', 'appointments', 'reservations', 'calendar', 'availability', 'scheduling', 'waitlist', 'reminders', 'check-in'],

  // Content
  content: ['blog', 'cms', 'gallery', 'documents', 'media', 'comments', 'tags', 'categories'],

  // Communication
  communication: ['messaging', 'chat', 'email', 'announcements', 'feedback', 'support-tickets'],

  // Business
  business: ['crm', 'reporting', 'team-management', 'workflow', 'tasks', 'projects', 'clients', 'contracts'],

  // Hospitality
  hospitality: ['table-reservations', 'menu-management', 'kitchen-display', 'room-booking', 'housekeeping', 'guest-services', 'pos-system', 'channel-manager', 'rate-management', 'food-ordering'],

  // Fitness
  fitness: ['class-scheduling', 'membership-plans', 'workout-tracking', 'trainer-booking', 'body-measurements', 'nutrition-tracking', 'fitness-challenges', 'class-packages', 'equipment-booking', 'group-training'],

  // Real Estate
  realEstate: ['property-listings', 'virtual-tours', 'mls-integration', 'showing-management', 'property-valuation', 'lease-management', 'tenant-screening', 'rent-collection', 'maintenance-requests', 'open-houses'],

  // Healthcare
  healthcare: ['patient-records', 'treatment-plans', 'prescriptions', 'insurance-billing', 'telemedicine', 'lab-results', 'vital-signs', 'referrals', 'immunizations', 'medical-imaging'],

  // Education
  education: ['course-management', 'student-records', 'grading', 'assignments', 'lms', 'attendance', 'parent-portal', 'transcripts', 'certificates', 'enrollment', 'class-roster'],

  // Legal
  legal: ['case-management', 'client-intake', 'document-assembly', 'court-calendar', 'billing-timekeeping', 'conflict-check', 'matter-notes', 'client-portal'],

  // Automotive
  automotive: ['vehicle-inventory', 'test-drives', 'vehicle-history', 'trade-in-valuation', 'service-scheduling', 'parts-catalog', 'vehicle-financing', 'recalls-tracking'],

  // Construction
  construction: ['project-bids', 'subcontractor-mgmt', 'material-takeoffs', 'site-safety', 'daily-logs', 'change-orders', 'punch-lists', 'equipment-tracking'],

  // Entertainment
  entertainment: ['ticket-sales', 'venue-booking', 'seating-charts', 'performer-profiles', 'show-scheduling', 'box-office', 'season-passes', 'backstage-access'],

  // Logistics
  logistics: ['shipment-tracking', 'route-optimization', 'warehouse-mgmt', 'freight-quotes', 'carrier-integration', 'proof-of-delivery', 'fleet-tracking', 'customs-docs'],
};

// Flatten all features for reference
const ALL_FEATURE_IDS = Object.values(EXISTING_FEATURES).flat();

// ─────────────────────────────────────────────────────────────
// CATEGORY MAPPINGS
// ─────────────────────────────────────────────────────────────
interface CategoryMapping {
  category: string;
  industry: string;
  defaultFeatures: string[];
  optionalFeatures: string[];
  complexity: 'simple' | 'medium' | 'moderate' | 'complex';
  requiresPayment: boolean;
  colorScheme: string;
  designVariant: string;
  icon: string;
}

const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  // Healthcare & Medical
  healthcare: {
    category: 'healthcare',
    industry: 'healthcare',
    defaultFeatures: ['user-auth', 'appointments', 'patient-records', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['telemedicine', 'prescriptions', 'insurance-billing', 'messaging', 'documents', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'stethoscope',
  },
  medical: {
    category: 'healthcare',
    industry: 'healthcare',
    defaultFeatures: ['user-auth', 'appointments', 'patient-records', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['telemedicine', 'prescriptions', 'lab-results', 'vital-signs', 'referrals'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'medical',
  },
  clinic: {
    category: 'healthcare',
    industry: 'healthcare',
    defaultFeatures: ['user-auth', 'appointments', 'patient-records', 'calendar', 'check-in', 'notifications'],
    optionalFeatures: ['insurance-billing', 'prescriptions', 'telemedicine', 'payments', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'teal',
    designVariant: 'clean',
    icon: 'clinic',
  },
  therapy: {
    category: 'healthcare',
    industry: 'healthcare',
    defaultFeatures: ['user-auth', 'appointments', 'calendar', 'scheduling', 'notifications', 'search'],
    optionalFeatures: ['treatment-plans', 'documents', 'invoicing', 'payments', 'messaging'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'calm',
    icon: 'heart',
  },
  dental: {
    category: 'healthcare',
    industry: 'healthcare',
    defaultFeatures: ['user-auth', 'appointments', 'patient-records', 'treatment-plans', 'calendar', 'notifications'],
    optionalFeatures: ['insurance-billing', 'payments', 'reminders', 'gallery', 'reviews'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'cyan',
    designVariant: 'clean',
    icon: 'tooth',
  },

  // Fitness & Wellness
  fitness: {
    category: 'fitness',
    industry: 'fitness',
    defaultFeatures: ['user-auth', 'membership-plans', 'class-scheduling', 'check-in', 'notifications', 'search'],
    optionalFeatures: ['workout-tracking', 'trainer-booking', 'payments', 'body-measurements', 'nutrition-tracking'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'red',
    designVariant: 'energetic',
    icon: 'dumbbell',
  },
  gym: {
    category: 'fitness',
    industry: 'fitness',
    defaultFeatures: ['user-auth', 'membership-plans', 'class-scheduling', 'check-in', 'trainer-booking', 'notifications'],
    optionalFeatures: ['workout-tracking', 'body-measurements', 'payments', 'equipment-booking', 'group-training'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'red',
    designVariant: 'bold',
    icon: 'building',
  },
  yoga: {
    category: 'fitness',
    industry: 'wellness',
    defaultFeatures: ['user-auth', 'class-scheduling', 'reservations', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['membership-plans', 'payments', 'trainer-booking', 'gallery', 'reviews'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'calm',
    icon: 'lotus',
  },
  wellness: {
    category: 'wellness',
    industry: 'wellness',
    defaultFeatures: ['user-auth', 'appointments', 'calendar', 'notifications', 'search', 'gallery'],
    optionalFeatures: ['membership-plans', 'payments', 'reviews', 'blog', 'messaging'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'green',
    designVariant: 'natural',
    icon: 'leaf',
  },
  spa: {
    category: 'wellness',
    industry: 'wellness',
    defaultFeatures: ['user-auth', 'appointments', 'pos-system', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['membership-plans', 'payments', 'reviews', 'gallery', 'discounts'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'pink',
    designVariant: 'elegant',
    icon: 'spa',
  },

  // Professional Services
  professional: {
    category: 'professional-services',
    industry: 'professional-services',
    defaultFeatures: ['user-auth', 'appointments', 'clients', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['invoicing', 'payments', 'documents', 'contracts', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'slate',
    designVariant: 'professional',
    icon: 'briefcase',
  },
  consulting: {
    category: 'professional-services',
    industry: 'consulting',
    defaultFeatures: ['user-auth', 'appointments', 'clients', 'projects', 'calendar', 'notifications'],
    optionalFeatures: ['invoicing', 'contracts', 'documents', 'time-tracking', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'indigo',
    designVariant: 'professional',
    icon: 'chart',
  },
  legal: {
    category: 'legal',
    industry: 'legal',
    defaultFeatures: ['user-auth', 'case-management', 'client-intake', 'billing-timekeeping', 'documents', 'notifications'],
    optionalFeatures: ['court-calendar', 'document-assembly', 'conflict-check', 'payments', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'slate',
    designVariant: 'professional',
    icon: 'scale',
  },
  law: {
    category: 'legal',
    industry: 'legal',
    defaultFeatures: ['user-auth', 'case-management', 'client-intake', 'billing-timekeeping', 'documents', 'notifications'],
    optionalFeatures: ['court-calendar', 'document-assembly', 'conflict-check', 'payments', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'slate',
    designVariant: 'professional',
    icon: 'scale',
  },
  accounting: {
    category: 'finance',
    industry: 'finance',
    defaultFeatures: ['user-auth', 'clients', 'invoicing', 'documents', 'calendar', 'notifications'],
    optionalFeatures: ['reporting', 'payments', 'time-tracking', 'contracts', 'tasks'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'green',
    designVariant: 'professional',
    icon: 'calculator',
  },

  // Hospitality & Food
  hospitality: {
    category: 'hospitality',
    industry: 'hospitality',
    defaultFeatures: ['user-auth', 'reservations', 'pos-system', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'discounts', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'amber',
    designVariant: 'warm',
    icon: 'hotel',
  },
  restaurant: {
    category: 'hospitality',
    industry: 'food-beverage',
    defaultFeatures: ['user-auth', 'table-reservations', 'menu-management', 'food-ordering', 'pos-system', 'notifications'],
    optionalFeatures: ['kitchen-display', 'payments', 'reviews', 'discounts', 'delivery'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'modern',
    icon: 'utensils',
  },
  cafe: {
    category: 'hospitality',
    industry: 'food-beverage',
    defaultFeatures: ['user-auth', 'menu-management', 'food-ordering', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'subscriptions', 'discounts', 'loyalty'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'brown',
    designVariant: 'cozy',
    icon: 'coffee',
  },
  bakery: {
    category: 'hospitality',
    industry: 'food-beverage',
    defaultFeatures: ['user-auth', 'product-catalog', 'orders', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'subscriptions', 'shipping'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'amber',
    designVariant: 'warm',
    icon: 'bread',
  },
  hotel: {
    category: 'hospitality',
    industry: 'hospitality',
    defaultFeatures: ['user-auth', 'room-booking', 'housekeeping', 'guest-services', 'channel-manager', 'notifications'],
    optionalFeatures: ['rate-management', 'payments', 'reviews', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'amber',
    designVariant: 'elegant',
    icon: 'hotel',
  },
  catering: {
    category: 'hospitality',
    industry: 'food-beverage',
    defaultFeatures: ['user-auth', 'orders', 'menu-management', 'calendar', 'invoicing', 'notifications'],
    optionalFeatures: ['payments', 'contracts', 'clients', 'reporting', 'gallery'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'elegant',
    icon: 'plate',
  },

  // Real Estate & Property
  realEstate: {
    category: 'real-estate',
    industry: 'real-estate',
    defaultFeatures: ['user-auth', 'property-listings', 'showing-management', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['virtual-tours', 'mls-integration', 'property-valuation', 'clients', 'crm'],
    complexity: 'complex',
    requiresPayment: false,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'home',
  },
  property: {
    category: 'real-estate',
    industry: 'real-estate',
    defaultFeatures: ['user-auth', 'property-listings', 'lease-management', 'maintenance-requests', 'notifications', 'search'],
    optionalFeatures: ['rent-collection', 'tenant-screening', 'payments', 'documents', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'clean',
    icon: 'building',
  },
  rental: {
    category: 'rental',
    industry: 'rental',
    defaultFeatures: ['user-auth', 'inventory', 'reservations', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'invoicing', 'check-in', 'reviews', 'discounts'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'teal',
    designVariant: 'modern',
    icon: 'key',
  },

  // Education
  education: {
    category: 'education',
    industry: 'education',
    defaultFeatures: ['user-auth', 'course-management', 'student-records', 'assignments', 'notifications', 'search'],
    optionalFeatures: ['grading', 'attendance', 'lms', 'certificates', 'parent-portal'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'clean',
    icon: 'graduation',
  },
  school: {
    category: 'education',
    industry: 'education',
    defaultFeatures: ['user-auth', 'student-records', 'attendance', 'class-roster', 'calendar', 'notifications'],
    optionalFeatures: ['grading', 'assignments', 'parent-portal', 'transcripts', 'enrollment'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'clean',
    icon: 'school',
  },
  tutoring: {
    category: 'education',
    industry: 'education',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'messaging', 'documents', 'progress-tracking'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'indigo',
    designVariant: 'friendly',
    icon: 'book',
  },
  training: {
    category: 'education',
    industry: 'education',
    defaultFeatures: ['user-auth', 'course-management', 'enrollment', 'calendar', 'certificates', 'notifications'],
    optionalFeatures: ['lms', 'assignments', 'payments', 'attendance', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'professional',
    icon: 'certificate',
  },

  // Retail & Commerce
  retail: {
    category: 'retail',
    industry: 'retail',
    defaultFeatures: ['user-auth', 'product-catalog', 'shopping-cart', 'checkout', 'orders', 'notifications'],
    optionalFeatures: ['payments', 'inventory', 'discounts', 'reviews', 'shipping'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'modern',
    icon: 'shopping-bag',
  },
  ecommerce: {
    category: 'ecommerce',
    industry: 'retail',
    defaultFeatures: ['user-auth', 'product-catalog', 'shopping-cart', 'checkout', 'orders', 'payments'],
    optionalFeatures: ['inventory', 'discounts', 'reviews', 'wishlist', 'shipping'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'modern',
    icon: 'cart',
  },
  shop: {
    category: 'retail',
    industry: 'retail',
    defaultFeatures: ['user-auth', 'product-catalog', 'orders', 'pos-system', 'inventory', 'notifications'],
    optionalFeatures: ['payments', 'discounts', 'reviews', 'analytics', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'teal',
    designVariant: 'clean',
    icon: 'store',
  },
  store: {
    category: 'retail',
    industry: 'retail',
    defaultFeatures: ['user-auth', 'product-catalog', 'inventory', 'pos-system', 'orders', 'notifications'],
    optionalFeatures: ['shopping-cart', 'checkout', 'payments', 'discounts', 'reviews'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'clean',
    icon: 'store',
  },

  // Automotive
  automotive: {
    category: 'automotive',
    industry: 'automotive',
    defaultFeatures: ['user-auth', 'vehicle-inventory', 'appointments', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['service-scheduling', 'parts-catalog', 'invoicing', 'payments', 'reviews'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'gray',
    designVariant: 'industrial',
    icon: 'car',
  },
  auto: {
    category: 'automotive',
    industry: 'automotive',
    defaultFeatures: ['user-auth', 'service-scheduling', 'appointments', 'parts-catalog', 'invoicing', 'notifications'],
    optionalFeatures: ['vehicle-history', 'payments', 'reviews', 'inventory', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'gray',
    designVariant: 'industrial',
    icon: 'wrench',
  },
  dealership: {
    category: 'automotive',
    industry: 'automotive',
    defaultFeatures: ['user-auth', 'vehicle-inventory', 'test-drives', 'vehicle-financing', 'crm', 'notifications'],
    optionalFeatures: ['trade-in-valuation', 'recalls-tracking', 'payments', 'reviews', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'car-front',
  },

  // Construction & Trades
  construction: {
    category: 'construction',
    industry: 'construction',
    defaultFeatures: ['user-auth', 'projects', 'project-bids', 'daily-logs', 'calendar', 'notifications'],
    optionalFeatures: ['subcontractor-mgmt', 'material-takeoffs', 'invoicing', 'documents', 'site-safety'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'industrial',
    icon: 'hammer',
  },
  contractor: {
    category: 'construction',
    industry: 'construction',
    defaultFeatures: ['user-auth', 'projects', 'clients', 'scheduling', 'invoicing', 'notifications'],
    optionalFeatures: ['project-bids', 'contracts', 'documents', 'payments', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'industrial',
    icon: 'tool',
  },
  repair: {
    category: 'services',
    industry: 'services',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'invoicing', 'notifications', 'search'],
    optionalFeatures: ['inventory', 'payments', 'reviews', 'clients', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'gray',
    designVariant: 'practical',
    icon: 'wrench',
  },
  plumbing: {
    category: 'construction',
    industry: 'trades',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'invoicing', 'clients', 'notifications'],
    optionalFeatures: ['inventory', 'payments', 'reviews', 'dispatch', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'practical',
    icon: 'pipe',
  },
  electrical: {
    category: 'construction',
    industry: 'trades',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'invoicing', 'clients', 'notifications'],
    optionalFeatures: ['inventory', 'payments', 'reviews', 'documents', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'yellow',
    designVariant: 'practical',
    icon: 'bolt',
  },
  roofing: {
    category: 'construction',
    industry: 'trades',
    defaultFeatures: ['user-auth', 'project-bids', 'scheduling', 'invoicing', 'clients', 'notifications'],
    optionalFeatures: ['documents', 'payments', 'reviews', 'gallery', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'gray',
    designVariant: 'practical',
    icon: 'house',
  },

  // Entertainment & Events
  entertainment: {
    category: 'entertainment',
    industry: 'entertainment',
    defaultFeatures: ['user-auth', 'ticket-sales', 'venue-booking', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['seating-charts', 'payments', 'reviews', 'gallery', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'vibrant',
    icon: 'ticket',
  },
  event: {
    category: 'events',
    industry: 'events',
    defaultFeatures: ['user-auth', 'venue-booking', 'calendar', 'reservations', 'notifications', 'search'],
    optionalFeatures: ['ticket-sales', 'payments', 'gallery', 'reviews', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'pink',
    designVariant: 'elegant',
    icon: 'calendar',
  },
  venue: {
    category: 'entertainment',
    industry: 'events',
    defaultFeatures: ['user-auth', 'venue-booking', 'reservations', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['seating-charts', 'payments', 'gallery', 'reviews', 'contracts'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'indigo',
    designVariant: 'elegant',
    icon: 'building',
  },
  theater: {
    category: 'entertainment',
    industry: 'entertainment',
    defaultFeatures: ['user-auth', 'ticket-sales', 'show-scheduling', 'seating-charts', 'notifications', 'search'],
    optionalFeatures: ['season-passes', 'payments', 'reviews', 'gallery', 'box-office'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'red',
    designVariant: 'dramatic',
    icon: 'theater',
  },
  music: {
    category: 'entertainment',
    industry: 'entertainment',
    defaultFeatures: ['user-auth', 'media', 'gallery', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['ticket-sales', 'subscriptions', 'payments', 'reviews', 'analytics'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'creative',
    icon: 'music',
  },

  // Logistics & Transportation
  logistics: {
    category: 'logistics',
    industry: 'logistics',
    defaultFeatures: ['user-auth', 'shipment-tracking', 'route-optimization', 'fleet-tracking', 'notifications', 'search'],
    optionalFeatures: ['warehouse-mgmt', 'freight-quotes', 'carrier-integration', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'industrial',
    icon: 'truck',
  },
  shipping: {
    category: 'logistics',
    industry: 'logistics',
    defaultFeatures: ['user-auth', 'shipment-tracking', 'orders', 'invoicing', 'notifications', 'search'],
    optionalFeatures: ['carrier-integration', 'proof-of-delivery', 'payments', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'package',
  },
  delivery: {
    category: 'logistics',
    industry: 'logistics',
    defaultFeatures: ['user-auth', 'orders', 'route-optimization', 'fleet-tracking', 'notifications', 'search'],
    optionalFeatures: ['proof-of-delivery', 'payments', 'reviews', 'reporting', 'analytics'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'green',
    designVariant: 'modern',
    icon: 'delivery',
  },
  transportation: {
    category: 'transportation',
    industry: 'transportation',
    defaultFeatures: ['user-auth', 'reservations', 'fleet-tracking', 'scheduling', 'notifications', 'search'],
    optionalFeatures: ['payments', 'route-optimization', 'reviews', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'professional',
    icon: 'bus',
  },
  moving: {
    category: 'logistics',
    industry: 'services',
    defaultFeatures: ['user-auth', 'reservations', 'scheduling', 'invoicing', 'notifications', 'search'],
    optionalFeatures: ['inventory', 'payments', 'reviews', 'contracts', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'orange',
    designVariant: 'practical',
    icon: 'truck',
  },

  // Pets & Animals
  pets: {
    category: 'pets',
    industry: 'pets',
    defaultFeatures: ['user-auth', 'appointments', 'client-intake', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'reminders', 'messaging'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'amber',
    designVariant: 'friendly',
    icon: 'paw',
  },
  veterinary: {
    category: 'pets',
    industry: 'pets',
    defaultFeatures: ['user-auth', 'appointments', 'patient-records', 'prescriptions', 'calendar', 'notifications'],
    optionalFeatures: ['insurance-billing', 'payments', 'reminders', 'lab-results', 'immunizations'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'green',
    designVariant: 'professional',
    icon: 'stethoscope',
  },
  grooming: {
    category: 'pets',
    industry: 'pets',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'subscriptions', 'reminders'],
    complexity: 'simple',
    requiresPayment: true,
    colorScheme: 'pink',
    designVariant: 'playful',
    icon: 'scissors',
  },

  // Beauty & Personal Care
  beauty: {
    category: 'beauty',
    industry: 'beauty',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'subscriptions', 'discounts'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'pink',
    designVariant: 'elegant',
    icon: 'sparkles',
  },
  salon: {
    category: 'beauty',
    industry: 'beauty',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'team-management', 'discounts'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'pink',
    designVariant: 'elegant',
    icon: 'scissors',
  },
  barbershop: {
    category: 'beauty',
    industry: 'beauty',
    defaultFeatures: ['user-auth', 'appointments', 'scheduling', 'pos-system', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'gallery', 'waitlist', 'discounts'],
    complexity: 'simple',
    requiresPayment: true,
    colorScheme: 'gray',
    designVariant: 'classic',
    icon: 'scissors',
  },

  // Technology & IT
  technology: {
    category: 'technology',
    industry: 'technology',
    defaultFeatures: ['user-auth', 'projects', 'tasks', 'documents', 'notifications', 'search'],
    optionalFeatures: ['time-tracking', 'invoicing', 'clients', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'modern',
    icon: 'code',
  },
  software: {
    category: 'technology',
    industry: 'technology',
    defaultFeatures: ['user-auth', 'projects', 'tasks', 'documents', 'notifications', 'search'],
    optionalFeatures: ['time-tracking', 'invoicing', 'clients', 'reporting', 'analytics'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'indigo',
    designVariant: 'modern',
    icon: 'laptop',
  },
  saas: {
    category: 'subscription',
    industry: 'technology',
    defaultFeatures: ['user-auth', 'subscriptions', 'dashboard', 'analytics', 'notifications', 'settings'],
    optionalFeatures: ['payments', 'invoicing', 'support-tickets', 'documents', 'reporting'],
    complexity: 'complex',
    requiresPayment: true,
    colorScheme: 'purple',
    designVariant: 'modern',
    icon: 'cloud',
  },

  // Nonprofit & Community
  nonprofit: {
    category: 'nonprofit',
    industry: 'nonprofit',
    defaultFeatures: ['user-auth', 'crm', 'donations', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'events', 'messaging', 'blog', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'green',
    designVariant: 'warm',
    icon: 'heart',
  },
  church: {
    category: 'religious',
    industry: 'religious-spiritual',
    defaultFeatures: ['user-auth', 'calendar', 'announcements', 'donations', 'notifications', 'search'],
    optionalFeatures: ['payments', 'messaging', 'media', 'blog', 'events'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'indigo',
    designVariant: 'warm',
    icon: 'church',
  },
  community: {
    category: 'community',
    industry: 'community',
    defaultFeatures: ['user-auth', 'announcements', 'calendar', 'messaging', 'notifications', 'search'],
    optionalFeatures: ['events', 'blog', 'gallery', 'feedback', 'documents'],
    complexity: 'medium',
    requiresPayment: false,
    colorScheme: 'green',
    designVariant: 'friendly',
    icon: 'users',
  },

  // Default fallback
  default: {
    category: 'services',
    industry: 'services',
    defaultFeatures: ['user-auth', 'appointments', 'calendar', 'notifications', 'search'],
    optionalFeatures: ['payments', 'reviews', 'messaging', 'documents', 'reporting'],
    complexity: 'medium',
    requiresPayment: true,
    colorScheme: 'blue',
    designVariant: 'modern',
    icon: 'briefcase',
  },
};

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function kebabToTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function kebabToConstantCase(str: string): string {
  return str.toUpperCase().replace(/-/g, '_');
}

function getCategoryMapping(appId: string): CategoryMapping {
  // Check exact match first
  for (const [key, mapping] of Object.entries(CATEGORY_MAPPINGS)) {
    if (appId === key || appId.includes(key)) {
      return mapping;
    }
  }

  // Check patterns
  const patterns: [RegExp, string][] = [
    [/clinic|doctor|medical|health|care|therapy|therapist|nurse|pharmacy|dental|dermat|cardio|neuro|ortho|pediatr|psych|surgeon|urgent/i, 'healthcare'],
    [/gym|fitness|yoga|pilates|crossfit|boxing|martial|swim|sport|athletic/i, 'fitness'],
    [/spa|wellness|massage|beauty|salon|barber|nail|hair|cosmetic|skincare/i, 'beauty'],
    [/restaurant|cafe|bakery|catering|food|kitchen|bistro|pizzeria|bar|pub|grill|diner/i, 'restaurant'],
    [/hotel|hostel|motel|lodge|inn|resort|accommodation|airbnb|vacation/i, 'hotel'],
    [/law|legal|attorney|lawyer|paralegal|notary/i, 'legal'],
    [/school|academy|education|tutor|learning|training|bootcamp|course/i, 'education'],
    [/real-estate|property|apartment|rental|lease|tenant|landlord|realtor/i, 'realEstate'],
    [/auto|car|vehicle|motor|tire|mechanic|garage|dealership/i, 'automotive'],
    [/construction|contractor|builder|plumb|electric|hvac|roof|paint|flooring|landscap/i, 'construction'],
    [/shop|store|retail|boutique|market/i, 'shop'],
    [/ecommerce|online-store|marketplace/i, 'ecommerce'],
    [/event|wedding|party|venue|concert|theater|cinema|entertainment/i, 'entertainment'],
    [/ship|delivery|logistic|freight|courier|transport|moving|truck/i, 'logistics'],
    [/pet|vet|veterinar|groom|kennel|animal/i, 'pets'],
    [/consult|advisory|coach|mentor/i, 'consulting'],
    [/tech|software|app|web|digital|it-|saas|cloud/i, 'technology'],
    [/nonprofit|charity|church|temple|mosque|synagogue|ministry/i, 'nonprofit'],
    [/clean|laundry|maid|janitor/i, 'repair'],
    [/repair|service|maintenance|install/i, 'repair'],
  ];

  for (const [pattern, key] of patterns) {
    if (pattern.test(appId)) {
      return CATEGORY_MAPPINGS[key] || CATEGORY_MAPPINGS.default;
    }
  }

  return CATEGORY_MAPPINGS.default;
}

function generateKeywords(appId: string, name: string): string[] {
  const words = appId.split('-');
  const keywords = [
    appId.replace(/-/g, ' '),
    ...words,
    name.toLowerCase(),
    `${words[0]} software`,
    `${words[0]} app`,
    `${words[0]} platform`,
    `${words[0]} system`,
    `${words[0]} management`,
  ];

  // Add industry-specific keywords
  const mapping = getCategoryMapping(appId);
  if (mapping.industry) {
    keywords.push(`${mapping.industry} ${words[0]}`);
  }

  return [...new Set(keywords)].filter(k => k.length > 2);
}

function generateSynonyms(appId: string, name: string): string[] {
  const words = appId.split('-');
  return [
    `${name} platform`,
    `${name} software`,
    `${name} system`,
    `${words[0]} solution`,
    `${words[0]} service`,
  ];
}

function generateRoles(appId: string, mapping: CategoryMapping): any[] {
  const baseRoles = [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'staff',
      name: 'Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'user',
      name: 'User',
      level: 10,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ];

  // Customize based on category
  if (mapping.category === 'healthcare') {
    baseRoles[0].name = 'Practice Owner';
    baseRoles[1].name = 'Healthcare Provider';
    baseRoles[2].name = 'Patient';
    baseRoles[2].defaultRoute = '/appointments';
  } else if (mapping.category === 'education') {
    baseRoles[0].name = 'Administrator';
    baseRoles[1].name = 'Instructor';
    baseRoles[2].name = 'Student';
  } else if (mapping.category === 'fitness') {
    baseRoles[0].name = 'Owner';
    baseRoles[1].name = 'Trainer';
    baseRoles[2].name = 'Member';
    baseRoles[2].defaultRoute = '/dashboard';
  } else if (mapping.category === 'legal') {
    baseRoles[0].name = 'Managing Partner';
    baseRoles[1].name = 'Attorney';
    baseRoles[2].name = 'Client';
  } else if (mapping.category === 'hospitality') {
    baseRoles[0].name = 'Owner';
    baseRoles[1].name = 'Staff';
    baseRoles[2].name = 'Customer';
  } else if (mapping.category === 'real-estate') {
    baseRoles[0].name = 'Broker';
    baseRoles[1].name = 'Agent';
    baseRoles[2].name = 'Client';
  }

  return baseRoles;
}

function generateSections(appId: string, mapping: CategoryMapping): any[] {
  return [
    {
      id: 'frontend',
      name: 'Public Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public-facing interface',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Administrative interface',
    },
  ];
}

function generateLandingPage(appId: string, name: string, mapping: CategoryMapping): any {
  const mainEntity = mapping.defaultFeatures.includes('product-catalog') ? 'products' :
    mapping.defaultFeatures.includes('appointments') ? 'services' :
    mapping.defaultFeatures.includes('property-listings') ? 'properties' :
    mapping.defaultFeatures.includes('room-booking') ? 'rooms' :
    mapping.defaultFeatures.includes('course-management') ? 'courses' :
    'items';

  return {
    heroTitle: `Welcome to Your\\n${name}`,
    heroSubtitle: `Professional ${name.toLowerCase()} services tailored to your needs. Experience quality and excellence.`,
    primaryCta: {
      text: 'Get Started',
      route: '/get-started',
    },
    secondaryCta: {
      text: 'Learn More',
      route: '/about',
    },
    features: [
      {
        icon: '⭐',
        title: 'Quality Service',
        description: 'Professional and reliable service you can trust',
      },
      {
        icon: '🔒',
        title: 'Secure Platform',
        description: 'Your data is protected with enterprise-grade security',
      },
      {
        icon: '💬',
        title: '24/7 Support',
        description: 'Our team is here to help whenever you need us',
      },
    ],
    bottomCta: {
      title: 'Ready to Get Started?',
      subtitle: `Join thousands of satisfied ${mapping.industry} customers`,
      buttonText: 'Sign Up Now',
      buttonRoute: '/signup',
    },
    mainEntity,
    entityDisplayName: `Featured ${mainEntity.charAt(0).toUpperCase() + mainEntity.slice(1)}`,
  };
}

function generateExamplePrompts(appId: string, name: string): string[] {
  return [
    `Build a ${name.toLowerCase()} platform`,
    `Create a ${name.toLowerCase()} app`,
    `I need a ${name.toLowerCase()} management system`,
    `Build a ${appId.replace(/-/g, ' ')} solution`,
    `Create a ${name.toLowerCase()} booking system`,
  ];
}

function generateAppTypeFile(appId: string): string {
  const name = kebabToTitleCase(appId);
  const constName = `${kebabToConstantCase(appId)}_APP_TYPE`;
  const mapping = getCategoryMapping(appId);

  // Filter features to only include existing ones
  const defaultFeatures = mapping.defaultFeatures.filter(f => ALL_FEATURE_IDS.includes(f));
  const optionalFeatures = mapping.optionalFeatures.filter(f => ALL_FEATURE_IDS.includes(f));

  const content = `/**
 * ${name} App Type Definition
 *
 * Complete definition for ${name.toLowerCase()} applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ${constName}: AppTypeDefinition = {
  id: '${appId}',
  name: '${name}',
  category: '${mapping.category}',
  description: '${name} platform with comprehensive management features',
  icon: '${mapping.icon}',

  keywords: ${JSON.stringify(generateKeywords(appId, name), null, 4).replace(/\n/g, '\n  ')},

  synonyms: ${JSON.stringify(generateSynonyms(appId, name), null, 4).replace(/\n/g, '\n  ')},

  negativeKeywords: ['blog', 'portfolio'],

  sections: ${JSON.stringify(generateSections(appId, mapping), null, 4).replace(/\n/g, '\n  ')},

  roles: ${JSON.stringify(generateRoles(appId, mapping), null, 4).replace(/\n/g, '\n  ')},

  defaultFeatures: ${JSON.stringify(defaultFeatures, null, 4).replace(/\n/g, '\n  ')},

  optionalFeatures: ${JSON.stringify(optionalFeatures, null, 4).replace(/\n/g, '\n  ')},

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: ${mapping.requiresPayment},
  multiTenant: true,
  complexity: '${mapping.complexity}',
  industry: '${mapping.industry}',

  defaultColorScheme: '${mapping.colorScheme}',
  defaultDesignVariant: '${mapping.designVariant}',

  examplePrompts: ${JSON.stringify(generateExamplePrompts(appId, name), null, 4).replace(/\n/g, '\n  ')},
};
`;

  return content;
}

// ─────────────────────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────

async function main() {
  const appTypesDir = path.join(__dirname, '../src/modules/app-builder/registries/app-types');
  const missingAppsFile = '/tmp/missing_apps.txt';

  // Read missing apps
  const missingApps = fs.readFileSync(missingAppsFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log(`Found ${missingApps.length} missing app types to generate`);

  let generated = 0;
  let skipped = 0;

  for (const appId of missingApps) {
    const filePath = path.join(appTypesDir, `${appId}.ts`);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    try {
      const content = generateAppTypeFile(appId);
      fs.writeFileSync(filePath, content);
      generated++;

      if (generated % 100 === 0) {
        console.log(`Generated ${generated} app types...`);
      }
    } catch (error) {
      console.error(`Error generating ${appId}:`, error);
    }
  }

  console.log(`\nComplete!`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (existing): ${skipped}`);
}

main().catch(console.error);
