/**
 * Thrift Store App Type Definition
 *
 * Complete definition for thrift stores and secondhand retailers.
 * Essential for thrift shops, consignment stores, and resale boutiques.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THRIFT_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'thrift-store',
  name: 'Thrift Store',
  category: 'retail',
  description: 'Thrift store platform with donation intake, pricing systems, inventory turnover tracking, and charity integration',
  icon: 'recycle',

  keywords: [
    'thrift store',
    'secondhand shop',
    'thrift store software',
    'consignment store',
    'resale shop',
    'thrift store management',
    'donations',
    'thrift store practice',
    'thrift store scheduling',
    'used goods',
    'thrift store crm',
    'vintage clothing',
    'thrift store business',
    'charity shop',
    'thrift store pos',
    'sustainable fashion',
    'thrift store operations',
    'bargain shopping',
    'thrift store services',
    'resale retail',
  ],

  synonyms: [
    'thrift store platform',
    'thrift store software',
    'secondhand shop software',
    'consignment store software',
    'resale shop software',
    'donations software',
    'thrift store practice software',
    'used goods software',
    'vintage clothing software',
    'resale retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Items and donations' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and donations' },
  ],

  roles: [
    { id: 'admin', name: 'Store Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/donations' },
    { id: 'volunteer', name: 'Volunteer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'customer', name: 'Shopper', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'sustainable',

  examplePrompts: [
    'Build a thrift store platform',
    'Create a secondhand shop portal',
    'I need a thrift retail management system',
    'Build a thrift store business platform',
    'Create a donation and resale app',
  ],
};
