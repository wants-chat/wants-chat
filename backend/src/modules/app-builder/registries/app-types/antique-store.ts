/**
 * Antique Store App Type Definition
 *
 * Complete definition for antique store operations.
 * Essential for antique stores, vintage shops, and collectibles dealers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANTIQUE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'antique-store',
  name: 'Antique Store',
  category: 'retail',
  description: 'Antique store platform with inventory management, provenance tracking, appraisals, and consignment',
  icon: 'clock',

  keywords: [
    'antique store',
    'vintage shop',
    'antique store software',
    'collectibles',
    'antiques dealer',
    'antique store management',
    'inventory management',
    'antique store practice',
    'antique store scheduling',
    'provenance tracking',
    'antique store crm',
    'appraisals',
    'antique store business',
    'consignment',
    'antique store pos',
    'estate sales',
    'antique store operations',
    'rare finds',
    'antique store platform',
    'authentication',
  ],

  synonyms: [
    'antique store platform',
    'antique store software',
    'vintage shop software',
    'collectibles software',
    'antiques dealer software',
    'inventory management software',
    'antique store practice software',
    'provenance tracking software',
    'appraisals software',
    'authentication software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and sales' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and consignment' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
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
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'vintage',

  examplePrompts: [
    'Build an antique store platform',
    'Create a vintage shop inventory portal',
    'I need a collectibles management system',
    'Build an antiques consignment platform',
    'Create a provenance and appraisal app',
  ],
};
