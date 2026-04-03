/**
 * Bakery App Type Definition
 *
 * Complete definition for bakery and pastry shop applications.
 * Essential for bakeries, pastry shops, and custom cake businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'bakery',
  name: 'Bakery',
  category: 'food-beverage',
  description: 'Bakery platform with product catalog, custom orders, pre-ordering, and pickup/delivery scheduling',
  icon: 'cake',

  keywords: [
    'bakery',
    'pastry shop',
    'cake shop',
    'bread bakery',
    'custom cakes',
    'wedding cakes',
    'bakery ordering',
    'pastries',
    'baked goods',
    'artisan bakery',
    'cupcakes',
    'cookies',
    'croissants',
    'bakery menu',
    'cake ordering',
    'bakery pre-order',
    'fresh bread',
    'birthday cakes',
    'desserts',
    'patisserie',
  ],

  synonyms: [
    'bakery platform',
    'bakery software',
    'cake shop software',
    'bakery ordering system',
    'custom cake software',
    'pastry shop software',
    'bakery management software',
    'cake ordering platform',
    'artisan bakery software',
    'bakery pos',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant full service'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and order' },
    { id: 'admin', name: 'Bakery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Orders and production' },
  ],

  roles: [
    { id: 'admin', name: 'Bakery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Bakery Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'baker', name: 'Baker', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'sales', name: 'Counter Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
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
    'kitchen-display',
    'reviews',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a bakery ordering platform',
    'Create a custom cake shop app',
    'I need a bakery management system',
    'Build a pastry shop with pre-orders',
    'Create a bakery with delivery',
  ],
};
