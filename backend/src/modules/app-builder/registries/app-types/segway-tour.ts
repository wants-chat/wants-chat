/**
 * Segway Tour App Type Definition
 *
 * Complete definition for Segway and e-scooter tour operations.
 * Essential for Segway tour operators, city tours, and e-vehicle experiences.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEGWAY_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'segway-tour',
  name: 'Segway Tour',
  category: 'entertainment',
  description: 'Segway tour platform with tour booking, vehicle fleet management, guide scheduling, and training certification',
  icon: 'navigation',

  keywords: [
    'segway tour',
    'city tour',
    'segway tour software',
    'e-scooter tour',
    'guided experience',
    'segway tour management',
    'tour booking',
    'segway tour practice',
    'segway tour scheduling',
    'fleet management',
    'segway tour crm',
    'guide scheduling',
    'segway tour business',
    'training certification',
    'segway tour pos',
    'sightseeing',
    'segway tour operations',
    'electric vehicle',
    'segway tour platform',
    'neighborhood tour',
  ],

  synonyms: [
    'segway tour platform',
    'segway tour software',
    'city tour software',
    'e-scooter tour software',
    'guided experience software',
    'tour booking software',
    'segway tour practice software',
    'fleet management software',
    'guide scheduling software',
    'sightseeing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tours and booking' },
    { id: 'admin', name: 'Tour Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and guides' },
  ],

  roles: [
    { id: 'admin', name: 'Tour Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'guide', name: 'Tour Guide', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tours' },
    { id: 'staff', name: 'Training Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/training' },
    { id: 'customer', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a Segway tour platform',
    'Create a city tour portal',
    'I need an e-scooter tour system',
    'Build a guided tour booking platform',
    'Create a sightseeing app',
  ],
};
