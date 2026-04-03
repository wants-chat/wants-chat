/**
 * Coin Operated Laundry App Type Definition
 *
 * Complete definition for laundromat and coin laundry operations.
 * Essential for laundromat owners, coin laundry operators, and self-service laundry.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COIN_OPERATED_LAUNDRY_APP_TYPE: AppTypeDefinition = {
  id: 'coin-operated-laundry',
  name: 'Coin Operated Laundry',
  category: 'services',
  description: 'Coin operated laundry platform with machine monitoring, payment systems, maintenance tracking, and customer loyalty',
  icon: 'washing-machine',

  keywords: [
    'coin operated laundry',
    'laundromat',
    'coin operated laundry software',
    'self service laundry',
    'coin laundry',
    'coin operated laundry management',
    'machine monitoring',
    'coin operated laundry practice',
    'coin operated laundry scheduling',
    'payment systems',
    'coin operated laundry crm',
    'maintenance tracking',
    'coin operated laundry business',
    'customer loyalty',
    'coin operated laundry pos',
    'wash fold',
    'coin operated laundry operations',
    'card payment',
    'coin operated laundry platform',
    'dry cleaning pickup',
  ],

  synonyms: [
    'coin operated laundry platform',
    'coin operated laundry software',
    'laundromat software',
    'self service laundry software',
    'coin laundry software',
    'machine monitoring software',
    'coin operated laundry practice software',
    'payment systems software',
    'maintenance tracking software',
    'wash fold software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Locations and services' },
    { id: 'admin', name: 'Owner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Machines and revenue' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Location Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/machines' },
    { id: 'attendant', name: 'Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a coin operated laundry platform',
    'Create a laundromat management app',
    'I need a coin laundry system',
    'Build a self-service laundry app',
    'Create a laundromat owner portal',
  ],
};
