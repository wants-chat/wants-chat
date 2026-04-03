/**
 * Lawn Care App Type Definition
 *
 * Complete definition for lawn care service operations.
 * Essential for lawn maintenance companies, mowing services, and turf care specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAWN_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'lawn-care',
  name: 'Lawn Care',
  category: 'services',
  description: 'Lawn care platform with service scheduling, route optimization, treatment tracking, and customer communication',
  icon: 'leaf',

  keywords: [
    'lawn care',
    'lawn maintenance',
    'lawn care software',
    'mowing service',
    'turf care',
    'lawn care management',
    'service scheduling',
    'lawn care practice',
    'lawn care scheduling',
    'route optimization',
    'lawn care crm',
    'treatment tracking',
    'lawn care business',
    'customer communication',
    'lawn care pos',
    'fertilization',
    'lawn care operations',
    'weed control',
    'lawn care platform',
    'aeration',
  ],

  synonyms: [
    'lawn care platform',
    'lawn care software',
    'lawn maintenance software',
    'mowing service software',
    'turf care software',
    'service scheduling software',
    'lawn care practice software',
    'route optimization software',
    'treatment tracking software',
    'fertilization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and scheduling' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'technician', name: 'Lawn Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'daily-logs',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'time-tracking',
    'reporting',
    'analytics',
    'equipment-tracking',
    'material-takeoffs',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build a lawn care platform',
    'Create a lawn maintenance portal',
    'I need a lawn care management system',
    'Build a route optimization platform',
    'Create a service scheduling and tracking app',
  ],
};
