/**
 * Marina Management App Type Definition
 *
 * Complete definition for marina and boat slip operations.
 * Essential for marinas, yacht clubs, and boat storage facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARINA_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'marina-management',
  name: 'Marina Management',
  category: 'property',
  description: 'Marina management platform with slip reservations, fuel dock operations, maintenance scheduling, and member services',
  icon: 'anchor',

  keywords: [
    'marina management',
    'yacht club',
    'marina management software',
    'boat storage',
    'dock management',
    'marina management system',
    'slip reservations',
    'marina management practice',
    'marina management scheduling',
    'fuel dock',
    'marina management crm',
    'maintenance scheduling',
    'marina management business',
    'member services',
    'marina management pos',
    'transient slips',
    'marina management operations',
    'dry storage',
    'marina management platform',
    'pump out',
  ],

  synonyms: [
    'marina management platform',
    'marina management software',
    'yacht club software',
    'boat storage software',
    'dock management software',
    'slip reservations software',
    'marina management practice software',
    'fuel dock software',
    'maintenance scheduling software',
    'transient slips software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Slips and services' },
    { id: 'admin', name: 'Marina Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Marina Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'harbormaster', name: 'Harbormaster', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/slips' },
    { id: 'staff', name: 'Dock Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fuel' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'property',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'nautical',

  examplePrompts: [
    'Build a marina management platform',
    'Create a yacht club portal',
    'I need a boat slip system',
    'Build a dock reservation platform',
    'Create a marina operations app',
  ],
};
