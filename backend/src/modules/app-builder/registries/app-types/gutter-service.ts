/**
 * Gutter Service App Type Definition
 *
 * Complete definition for gutter installation and cleaning operations.
 * Essential for gutter companies, seamless gutter installers, and gutter guard services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GUTTER_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'gutter-service',
  name: 'Gutter Service',
  category: 'services',
  description: 'Gutter service platform with job scheduling, measurement tracking, material management, and maintenance plans',
  icon: 'droplet',

  keywords: [
    'gutter service',
    'gutter installation',
    'gutter service software',
    'gutter cleaning',
    'seamless gutter',
    'gutter service management',
    'job scheduling',
    'gutter service practice',
    'gutter service scheduling',
    'measurement tracking',
    'gutter service crm',
    'material management',
    'gutter service business',
    'maintenance plans',
    'gutter service pos',
    'gutter guards',
    'gutter service operations',
    'downspout',
    'gutter service platform',
    'leaf protection',
  ],

  synonyms: [
    'gutter service platform',
    'gutter service software',
    'gutter installation software',
    'gutter cleaning software',
    'seamless gutter software',
    'job scheduling software',
    'gutter service practice software',
    'measurement tracking software',
    'material management software',
    'gutter guards software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and service' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'change-orders',
    'punch-lists',
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
    'Build a gutter service platform',
    'Create a gutter installation app',
    'I need a gutter cleaning scheduling system',
    'Build a seamless gutter business app',
    'Create a gutter company portal',
  ],
};
