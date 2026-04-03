/**
 * Furniture Store App Type Definition
 *
 * Complete definition for furniture retail and home decor applications.
 * Essential for furniture stores, home decor retailers, and interior designers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_APP_TYPE: AppTypeDefinition = {
  id: 'furniture',
  name: 'Furniture Store',
  category: 'ecommerce',
  description: 'Furniture ecommerce platform with room visualization, delivery scheduling, and financing options',
  icon: 'couch',

  keywords: [
    'furniture',
    'furniture store',
    'home decor',
    'interior design',
    'sofas',
    'beds',
    'tables',
    'chairs',
    'wayfair',
    'ikea',
    'ashley furniture',
    'west elm',
    'pottery barn',
    'living room',
    'bedroom',
    'dining room',
    'office furniture',
    'outdoor furniture',
    'custom furniture',
    'furniture delivery',
    'mattresses',
    'home furnishings',
  ],

  synonyms: [
    'furniture platform',
    'furniture store software',
    'furniture ecommerce',
    'home decor app',
    'furniture shop app',
    'furniture retail software',
    'home furnishing platform',
    'furniture ordering system',
    'furniture business app',
    'furniture management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Store', enabled: true, basePath: '/', layout: 'public', description: 'Browse and purchase furniture' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Store and inventory management' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'sales', name: 'Sales Associate', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/customers' },
    { id: 'warehouse', name: 'Warehouse Staff', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
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
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a furniture ecommerce store',
    'Create a home decor retail platform',
    'I need a furniture shop with room visualization',
    'Build a furniture store like Wayfair',
    'Create a furniture delivery platform',
  ],
};
