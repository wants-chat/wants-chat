/**
 * Distillery App Type Definition
 *
 * Complete definition for distillery and spirits applications.
 * Essential for craft distilleries, spirits producers, and tasting rooms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DISTILLERY_APP_TYPE: AppTypeDefinition = {
  id: 'distillery',
  name: 'Distillery',
  category: 'food-beverage',
  description: 'Distillery platform with spirits catalog, tasting experiences, bottle sales, and spirits club management',
  icon: 'flask',

  keywords: [
    'distillery',
    'craft distillery',
    'spirits',
    'whiskey distillery',
    'bourbon distillery',
    'vodka distillery',
    'gin distillery',
    'rum distillery',
    'tequila distillery',
    'spirits tasting',
    'distillery tours',
    'spirits club',
    'craft spirits',
    'artisan distillery',
    'spirits sales',
    'bottle sales',
    'distillery app',
    'spirits subscription',
    'liquor',
    'distillery events',
  ],

  synonyms: [
    'distillery platform',
    'distillery software',
    'craft distillery software',
    'spirits software',
    'distillery management software',
    'spirits club software',
    'distillery ecommerce',
    'tasting room software',
    'spirits production software',
    'distillery tour software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'water distiller'],

  sections: [
    { id: 'frontend', name: 'Spirits Shop', enabled: true, basePath: '/', layout: 'public', description: 'Shop spirits and book tastings' },
    { id: 'admin', name: 'Distillery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Spirits and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Distillery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Tasting Room Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tastings' },
    { id: 'distiller', name: 'Head Distiller', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'guide', name: 'Tour Guide', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tours' },
    { id: 'member', name: 'Spirits Club Member', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/member' },
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

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a craft distillery platform',
    'Create a whiskey distillery app',
    'I need a spirits club management system',
    'Build a distillery with tours and sales',
    'Create a spirits tasting room app',
  ],
};
