/**
 * Toy Store App Type Definition
 *
 * Complete definition for toy stores and children's retail.
 * Essential for toy shops, game stores, and children's gift retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOY_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'toy-store',
  name: 'Toy Store',
  category: 'retail',
  description: 'Toy store platform with age-based categories, gift registry, party supplies, and educational toy sections',
  icon: 'gamepad-2',

  keywords: [
    'toy store',
    'toy shop',
    'toy store software',
    'childrens toys',
    'game store',
    'toy store management',
    'educational toys',
    'toy store practice',
    'toy store scheduling',
    'gift registry',
    'toy store crm',
    'board games',
    'toy store business',
    'party supplies',
    'toy store pos',
    'puzzles',
    'toy store operations',
    'collectibles',
    'toy store services',
    'toy retail',
  ],

  synonyms: [
    'toy store platform',
    'toy store software',
    'toy shop software',
    'childrens toys software',
    'game store software',
    'educational toys software',
    'toy store practice software',
    'gift registry software',
    'board games software',
    'toy retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Toys and gifts' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
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

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a toy store platform',
    'Create a childrens toy shop portal',
    'I need a toy retail management system',
    'Build a toy store business platform',
    'Create a toy catalog and registry app',
  ],
};
