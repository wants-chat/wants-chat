/**
 * Winery App Type Definition
 *
 * Complete definition for winery and vineyard applications.
 * Essential for wineries, vineyards, wine clubs, and wine tasting rooms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINERY_APP_TYPE: AppTypeDefinition = {
  id: 'winery',
  name: 'Winery',
  category: 'food-beverage',
  description: 'Winery platform with wine club management, tasting reservations, online wine sales, and event booking',
  icon: 'wine',

  keywords: [
    'winery',
    'vineyard',
    'wine club',
    'wine tasting',
    'wine sales',
    'tasting room',
    'wine shop',
    'wine subscription',
    'wine events',
    'wine tours',
    'wine cellar',
    'wine production',
    'wine releases',
    'wine shipments',
    'wine membership',
    'wine pairing',
    'wine estate',
    'wine ecommerce',
    'wine reservations',
    'wine industry',
  ],

  synonyms: [
    'winery platform',
    'winery software',
    'wine club software',
    'vineyard software',
    'wine tasting software',
    'winery management software',
    'wine ecommerce software',
    'wine membership software',
    'winery reservation software',
    'wine club management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant only'],

  sections: [
    { id: 'frontend', name: 'Wine Shop', enabled: true, basePath: '/', layout: 'public', description: 'Shop wine and book tastings' },
    { id: 'admin', name: 'Winery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Wine club and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Winery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Tasting Room Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'sommelier', name: 'Sommelier', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tastings' },
    { id: 'staff', name: 'Tasting Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
    { id: 'member', name: 'Wine Club Member', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/member' },
    { id: 'customer', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'table-reservations',
    'food-ordering',
    'pos-system',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-beverage',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a winery ecommerce platform',
    'Create a wine club management app',
    'I need a winery tasting reservation system',
    'Build a vineyard with wine sales',
    'Create a wine membership platform',
  ],
};
