/**
 * Musical Instrument App Type Definition
 *
 * Complete definition for musical instrument store operations.
 * Essential for music stores, instrument dealers, and repair shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSICAL_INSTRUMENT_APP_TYPE: AppTypeDefinition = {
  id: 'musical-instrument',
  name: 'Musical Instrument',
  category: 'retail',
  description: 'Musical instrument platform with inventory management, rental programs, repair tracking, and lesson scheduling',
  icon: 'music',

  keywords: [
    'musical instrument',
    'music store',
    'musical instrument software',
    'instrument dealer',
    'guitar shop',
    'musical instrument management',
    'inventory management',
    'musical instrument practice',
    'musical instrument scheduling',
    'rental programs',
    'musical instrument crm',
    'repair tracking',
    'musical instrument business',
    'lesson scheduling',
    'musical instrument pos',
    'school rentals',
    'musical instrument operations',
    'consignment',
    'musical instrument platform',
    'trade-ins',
  ],

  synonyms: [
    'musical instrument platform',
    'musical instrument software',
    'music store software',
    'instrument dealer software',
    'guitar shop software',
    'inventory management software',
    'musical instrument practice software',
    'rental programs software',
    'repair tracking software',
    'lesson scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Instruments and lessons' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and services' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'technician', name: 'Repair Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a musical instrument store platform',
    'Create a music shop inventory portal',
    'I need a guitar shop management system',
    'Build an instrument rental platform',
    'Create a repair and lesson scheduling app',
  ],
};
