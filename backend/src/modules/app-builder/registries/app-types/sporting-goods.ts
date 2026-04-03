/**
 * Sporting Goods App Type Definition
 *
 * Complete definition for sporting goods stores and athletic equipment retailers.
 * Essential for sports shops, outdoor gear stores, and athletic supply retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTING_GOODS_APP_TYPE: AppTypeDefinition = {
  id: 'sporting-goods',
  name: 'Sporting Goods',
  category: 'retail',
  description: 'Sporting goods platform with equipment inventory, team sales, rental equipment, and fitting services',
  icon: 'activity',

  keywords: [
    'sporting goods',
    'sports store',
    'sporting goods software',
    'athletic equipment',
    'outdoor gear',
    'sporting goods management',
    'team sales',
    'sporting goods practice',
    'sporting goods scheduling',
    'fitness equipment',
    'sporting goods crm',
    'gear rental',
    'sporting goods business',
    'sports apparel',
    'sporting goods pos',
    'camping gear',
    'sporting goods operations',
    'ski equipment',
    'sporting goods services',
    'sports retail',
  ],

  synonyms: [
    'sporting goods platform',
    'sporting goods software',
    'sports store software',
    'athletic equipment software',
    'outdoor gear software',
    'team sales software',
    'sporting goods practice software',
    'fitness equipment software',
    'gear rental software',
    'sports retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'technology', 'healthcare'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and gear' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and sales' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a sporting goods store platform',
    'Create an athletic equipment shop portal',
    'I need a sports retail management system',
    'Build a sporting goods business platform',
    'Create an equipment sales and rental app',
  ],
};
