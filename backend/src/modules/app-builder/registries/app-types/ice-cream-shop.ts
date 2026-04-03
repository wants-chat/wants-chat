/**
 * Ice Cream Shop App Type Definition
 *
 * Complete definition for ice cream and frozen dessert applications.
 * Essential for ice cream shops, gelato shops, and frozen yogurt stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ICE_CREAM_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'ice-cream-shop',
  name: 'Ice Cream Shop',
  category: 'food-beverage',
  description: 'Ice cream shop platform with flavor catalog, custom orders, catering, and loyalty program',
  icon: 'ice-cream',

  keywords: [
    'ice cream shop',
    'ice cream parlor',
    'gelato shop',
    'frozen yogurt',
    'froyo',
    'ice cream store',
    'ice cream menu',
    'ice cream ordering',
    'ice cream catering',
    'scoops',
    'sundaes',
    'milkshakes',
    'ice cream cakes',
    'soft serve',
    'artisan ice cream',
    'ice cream flavors',
    'ice cream delivery',
    'dessert shop',
    'popsicles',
    'frozen treats',
  ],

  synonyms: [
    'ice cream shop platform',
    'ice cream software',
    'gelato shop software',
    'frozen yogurt software',
    'ice cream pos',
    'ice cream ordering software',
    'ice cream management software',
    'dessert shop software',
    'ice cream catering software',
    'frozen dessert software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant full'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse flavors and order' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Flavors and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'scooper', name: 'Scooper', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'orders',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reviews',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'food-beverage',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build an ice cream shop ordering app',
    'Create a gelato shop platform',
    'I need an ice cream parlor system',
    'Build a frozen yogurt shop app',
    'Create an ice cream catering platform',
  ],
};
