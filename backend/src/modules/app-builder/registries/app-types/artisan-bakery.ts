/**
 * Artisan Bakery App Type Definition
 *
 * Complete definition for artisan bakeries and specialty bread shops.
 * Essential for craft bakers, sourdough artisans, and specialty pastry shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-bakery',
  name: 'Artisan Bakery',
  category: 'food-production',
  description: 'Artisan bakery platform with product catalog, pre-orders, production scheduling, and wholesale management',
  icon: 'croissant',

  keywords: [
    'artisan bakery',
    'craft bakery',
    'artisan bakery software',
    'sourdough',
    'specialty bread',
    'artisan bakery management',
    'pastry shop',
    'artisan bakery practice',
    'artisan bakery scheduling',
    'custom cakes',
    'artisan bakery crm',
    'bread production',
    'artisan bakery business',
    'wholesale baking',
    'artisan bakery pos',
    'viennoiserie',
    'artisan bakery operations',
    'pre-orders',
    'artisan bakery services',
    'craft baking',
  ],

  synonyms: [
    'artisan bakery platform',
    'artisan bakery software',
    'craft bakery software',
    'sourdough software',
    'specialty bread software',
    'pastry shop software',
    'artisan bakery practice software',
    'custom cakes software',
    'bread production software',
    'craft baking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Bakery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Products and production' },
  ],

  roles: [
    { id: 'admin', name: 'Bakery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'baker', name: 'Head Baker', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'staff', name: 'Bakery Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
    'payments',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build an artisan bakery platform',
    'Create a craft bakery ordering portal',
    'I need a specialty bread shop management system',
    'Build an artisan bakery business platform',
    'Create a bakery production and ordering app',
  ],
};
