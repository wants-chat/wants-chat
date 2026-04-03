/**
 * Beauty Supply App Type Definition
 *
 * Complete definition for beauty supply and cosmetics retail applications.
 * Essential for beauty supply stores, cosmetics retailers, and beauty product sellers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BEAUTY_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'beauty-supply',
  name: 'Beauty Supply',
  category: 'ecommerce',
  description: 'Beauty supply ecommerce platform with product catalog, professional discounts, and loyalty programs',
  icon: 'spray-can-sparkles',

  keywords: [
    'beauty supply',
    'cosmetics store',
    'beauty products',
    'makeup store',
    'hair products',
    'skincare store',
    'sephora',
    'ulta',
    'sally beauty',
    'beauty retailer',
    'professional beauty',
    'hair care',
    'nail supplies',
    'esthetician supplies',
    'salon products',
    'beauty ecommerce',
    'cosmetics retail',
    'beauty shop',
    'makeup products',
    'beauty essentials',
    'fragrance',
    'beauty wholesale',
  ],

  synonyms: [
    'beauty supply platform',
    'cosmetics ecommerce',
    'beauty store app',
    'beauty retail software',
    'cosmetics store app',
    'beauty shop platform',
    'beauty products store',
    'makeup ecommerce',
    'beauty supply store',
    'cosmetics platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Store', enabled: true, basePath: '/', layout: 'public', description: 'Shopping and product discovery' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Store and inventory management' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'staff', name: 'Sales Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
    { id: 'pro', name: 'Professional', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/pro-shop' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'shopping-cart',
    'checkout',
    'orders',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'wishlist',
    'subscriptions',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a beauty supply ecommerce store',
    'Create a cosmetics retail platform',
    'I need a beauty products online store',
    'Build a beauty supply store like Ulta',
    'Create a salon products ecommerce app',
  ],
};
