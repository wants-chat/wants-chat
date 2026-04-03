/**
 * Music Store App Type Definition
 *
 * Complete definition for music stores and instrument retailers.
 * Essential for instrument shops, music equipment stores, and vinyl record shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'music-store',
  name: 'Music Store',
  category: 'retail',
  description: 'Music store platform with instrument inventory, rental programs, repair services, and lesson scheduling',
  icon: 'music',

  keywords: [
    'music store',
    'instrument shop',
    'music store software',
    'guitar shop',
    'music equipment',
    'music store management',
    'instrument rental',
    'music store practice',
    'music store scheduling',
    'vinyl records',
    'music store crm',
    'music lessons',
    'music store business',
    'instrument repair',
    'music store pos',
    'sheet music',
    'music store operations',
    'pro audio',
    'music store services',
    'music retail',
  ],

  synonyms: [
    'music store platform',
    'music store software',
    'instrument shop software',
    'guitar shop software',
    'music equipment software',
    'instrument rental software',
    'music store practice software',
    'vinyl records software',
    'music lessons software',
    'music retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Instruments and services' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a music store platform',
    'Create an instrument shop portal',
    'I need a music retail management system',
    'Build a music store business platform',
    'Create an instrument sales and rental app',
  ],
};
