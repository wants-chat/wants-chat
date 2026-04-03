/**
 * Boat Detailing App Type Definition
 *
 * Complete definition for boat cleaning and detailing operations.
 * Essential for boat detailing services, yacht maintenance, and marine cleaning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_DETAILING_APP_TYPE: AppTypeDefinition = {
  id: 'boat-detailing',
  name: 'Boat Detailing',
  category: 'services',
  description: 'Boat detailing platform with service scheduling, package management, marina partnerships, and before/after photos',
  icon: 'sparkles',

  keywords: [
    'boat detailing',
    'yacht maintenance',
    'boat detailing software',
    'marine cleaning',
    'boat wash',
    'boat detailing management',
    'service scheduling',
    'boat detailing practice',
    'boat detailing scheduling',
    'package management',
    'boat detailing crm',
    'marina partnerships',
    'boat detailing business',
    'before after photos',
    'boat detailing pos',
    'hull cleaning',
    'boat detailing operations',
    'waxing polishing',
    'boat detailing platform',
    'teak restoration',
  ],

  synonyms: [
    'boat detailing platform',
    'boat detailing software',
    'yacht maintenance software',
    'marine cleaning software',
    'boat wash software',
    'service scheduling software',
    'boat detailing practice software',
    'package management software',
    'marina partnerships software',
    'hull cleaning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'tech', name: 'Detail Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'gallery',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a boat detailing platform',
    'Create a yacht maintenance portal',
    'I need a marine cleaning system',
    'Build a boat washing platform',
    'Create a detailing service app',
  ],
};
