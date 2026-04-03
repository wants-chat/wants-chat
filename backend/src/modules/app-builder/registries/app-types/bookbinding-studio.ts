/**
 * Bookbinding Studio App Type Definition
 *
 * Complete definition for bookbinding and book arts operations.
 * Essential for bookbinding studios, book restoration, and paper arts centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOOKBINDING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'bookbinding-studio',
  name: 'Bookbinding Studio',
  category: 'artisan',
  description: 'Bookbinding studio platform with restoration orders, class scheduling, custom journal creation, and supply sales',
  icon: 'book',

  keywords: [
    'bookbinding studio',
    'book restoration',
    'bookbinding studio software',
    'paper arts',
    'custom journals',
    'bookbinding studio management',
    'restoration orders',
    'bookbinding studio practice',
    'bookbinding studio scheduling',
    'class scheduling',
    'bookbinding studio crm',
    'custom creation',
    'bookbinding studio business',
    'supply sales',
    'bookbinding studio pos',
    'leather binding',
    'bookbinding studio operations',
    'conservation',
    'bookbinding studio platform',
    'handmade books',
  ],

  synonyms: [
    'bookbinding studio platform',
    'bookbinding studio software',
    'book restoration software',
    'paper arts software',
    'custom journals software',
    'restoration orders software',
    'bookbinding studio practice software',
    'class scheduling software',
    'custom creation software',
    'leather binding software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and restoration' },
  ],

  roles: [
    { id: 'admin', name: 'Master Binder', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'binder', name: 'Bookbinder', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'staff', name: 'Studio Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a bookbinding studio platform',
    'Create a book restoration portal',
    'I need a paper arts studio system',
    'Build a custom journal platform',
    'Create a bookbinding class app',
  ],
};
