/**
 * Plumbing App Type Definition
 *
 * Complete definition for plumbing service applications.
 * Essential for plumbers, plumbing companies, and drain service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLUMBING_APP_TYPE: AppTypeDefinition = {
  id: 'plumbing',
  name: 'Plumbing',
  category: 'services',
  description: 'Plumbing platform with emergency dispatch, service scheduling, estimates, and technician management',
  icon: 'faucet-drip',

  keywords: [
    'plumbing',
    'plumber',
    'drain cleaning',
    'pipe repair',
    'water heater',
    'roto-rooter',
    'leak repair',
    'sewer service',
    'toilet repair',
    'faucet installation',
    'garbage disposal',
    'water line',
    'gas line',
    'backflow',
    'plumbing emergency',
    '24 hour plumber',
    'commercial plumbing',
    'residential plumbing',
    'plumbing contractor',
    'repiping',
    'sump pump',
    'plumbing service',
  ],

  synonyms: [
    'plumbing platform',
    'plumbing software',
    'plumber app',
    'plumbing service software',
    'plumbing management',
    'plumbing business app',
    'plumber dispatch',
    'plumbing company software',
    'drain service software',
    'plumbing scheduling',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and request emergency help' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dispatch and job management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'plumber', name: 'Plumber', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'apprentice', name: 'Apprentice', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'gallery',
    'inventory',
    'time-tracking',
    'reviews',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a plumbing service platform',
    'Create a plumber dispatch and scheduling app',
    'I need a plumbing company management software',
    'Build a drain cleaning service platform',
    'Create a 24/7 plumber service app',
  ],
};
