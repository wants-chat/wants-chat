/**
 * Cemetery App Type Definition
 *
 * Complete definition for cemetery and memorial park applications.
 * Essential for cemeteries, memorial parks, and burial grounds.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CEMETERY_APP_TYPE: AppTypeDefinition = {
  id: 'cemetery',
  name: 'Cemetery',
  category: 'religious',
  description: 'Cemetery platform with plot management, grave mapping, interment scheduling, and memorial records',
  icon: 'map',

  keywords: [
    'cemetery',
    'memorial park',
    'cemetery software',
    'burial ground',
    'grave mapping',
    'cemetery management',
    'interment services',
    'plot sales',
    'cemetery scheduling',
    'gravesite',
    'cemetery crm',
    'columbarium',
    'cemetery business',
    'mausoleum',
    'cemetery pos',
    'perpetual care',
    'cemetery operations',
    'memorial records',
    'cemetery services',
    'headstone',
  ],

  synonyms: [
    'cemetery platform',
    'cemetery software',
    'memorial park software',
    'burial ground software',
    'cemetery management software',
    'grave mapping software',
    'interment software',
    'plot management software',
    'cemetery operations software',
    'memorial records software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'pet cemetery'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Search and memorials' },
    { id: 'admin', name: 'Cemetery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Plots and records' },
  ],

  roles: [
    { id: 'admin', name: 'Superintendent', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/plots' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'visitor', name: 'Visitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a cemetery management platform',
    'Create a memorial park grave locator app',
    'I need a plot sales and interment system',
    'Build a cemetery records platform',
    'Create a gravesite mapping app',
  ],
};
