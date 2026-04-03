/**
 * Musical Instrument Shop App Type Definition
 *
 * Complete definition for musical instrument shop operations.
 * Essential for music stores, instrument dealers, and guitar shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSICAL_INSTRUMENT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'musical-instrument-shop',
  name: 'Musical Instrument Shop',
  category: 'retail',
  description: 'Musical instrument platform with inventory management, lesson scheduling, repair services, and rental programs',
  icon: 'music',

  keywords: [
    'musical instrument shop',
    'music store',
    'musical instrument shop software',
    'instrument dealer',
    'guitar shop',
    'musical instrument shop management',
    'inventory management',
    'musical instrument shop practice',
    'musical instrument shop scheduling',
    'lesson scheduling',
    'musical instrument shop crm',
    'repair services',
    'musical instrument shop business',
    'rental programs',
    'musical instrument shop pos',
    'piano store',
    'musical instrument shop operations',
    'band instruments',
    'musical instrument shop platform',
    'used instruments',
  ],

  synonyms: [
    'musical instrument shop platform',
    'musical instrument shop software',
    'music store software',
    'instrument dealer software',
    'guitar shop software',
    'inventory management software',
    'musical instrument shop practice software',
    'lesson scheduling software',
    'repair services software',
    'piano store software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Music Shop', enabled: true, basePath: '/', layout: 'public', description: 'Instruments and lessons' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and services' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'teacher', name: 'Music Teacher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'musician', name: 'Musician', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a musical instrument shop platform',
    'Create a music store app',
    'I need a guitar shop system',
    'Build an instrument dealer app',
    'Create a musical instrument shop portal',
  ],
};
