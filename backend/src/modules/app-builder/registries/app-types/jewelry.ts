/**
 * Jewelry Store App Type Definition
 *
 * Complete definition for jewelry retail and custom design applications.
 * Essential for jewelry stores, jewelers, and custom jewelry designers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry',
  name: 'Jewelry Store',
  category: 'ecommerce',
  description: 'Jewelry ecommerce platform with product customization, virtual try-on, and appointment booking',
  icon: 'gem',

  keywords: [
    'jewelry',
    'jewelry store',
    'jeweler',
    'diamonds',
    'engagement rings',
    'wedding bands',
    'fine jewelry',
    'custom jewelry',
    'gold',
    'silver',
    'platinum',
    'necklaces',
    'bracelets',
    'earrings',
    'watches',
    'jewelry repair',
    'appraisals',
    'brilliantearth',
    'bluenile',
    'james allen',
    'jewelry ecommerce',
    'luxury jewelry',
  ],

  synonyms: [
    'jewelry platform',
    'jewelry store software',
    'jeweler app',
    'jewelry ecommerce',
    'jewelry shop app',
    'fine jewelry platform',
    'jewelry retail software',
    'jewelry business app',
    'jewelry ordering system',
    'jewelry management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Store', enabled: true, basePath: '/', layout: 'public', description: 'Browse and purchase jewelry' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Store and inventory management' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'sales', name: 'Sales Associate', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/customers' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'shopping-cart',
    'checkout',
    'wishlist',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a jewelry ecommerce store',
    'Create a jewelry shop platform',
    'I need a custom jewelry design app',
    'Build an engagement ring store like Blue Nile',
    'Create a jewelry store with virtual try-on',
  ],
};
