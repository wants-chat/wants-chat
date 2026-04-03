/**
 * Boat Cleaning App Type Definition
 *
 * Complete definition for boat detailing and marine cleaning services.
 * Essential for boat detailing, yacht cleaning, and marine washing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'boat-cleaning',
  name: 'Boat Cleaning',
  category: 'marine',
  description: 'Boat cleaning platform with service scheduling, marina coordination, recurring appointments, and service packages',
  icon: 'sparkles',

  keywords: [
    'boat cleaning',
    'boat detailing',
    'boat cleaning software',
    'yacht cleaning',
    'boat washing',
    'boat cleaning management',
    'marine detailing',
    'boat cleaning service',
    'boat cleaning scheduling',
    'hull cleaning',
    'boat cleaning crm',
    'bottom cleaning',
    'boat cleaning business',
    'boat waxing',
    'boat cleaning pos',
    'canvas cleaning',
    'boat cleaning operations',
    'teak restoration',
    'boat cleaning services',
    'mobile detailing',
  ],

  synonyms: [
    'boat cleaning platform',
    'boat cleaning software',
    'boat detailing software',
    'yacht cleaning software',
    'boat washing software',
    'marine detailing software',
    'hull cleaning software',
    'bottom cleaning software',
    'boat waxing software',
    'mobile detailing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'car detailing'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'detailer', layout: 'admin', description: 'Jobs and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'detailer', name: 'Detailer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Boat Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a boat cleaning service platform',
    'Create a yacht detailing app',
    'I need a marine cleaning scheduling system',
    'Build a boat wash booking platform',
    'Create a hull cleaning service app',
  ],
};
