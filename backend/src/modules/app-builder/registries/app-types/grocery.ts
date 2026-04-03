/**
 * Grocery Delivery App Type Definition
 *
 * Complete definition for grocery delivery and ordering applications.
 * Essential for grocery stores, supermarkets, and delivery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GROCERY_APP_TYPE: AppTypeDefinition = {
  id: 'grocery',
  name: 'Grocery Delivery',
  category: 'commerce',
  description: 'Grocery ordering platform with product catalog, delivery scheduling, and shopper management',
  icon: 'shopping-basket',

  keywords: [
    'grocery',
    'grocery delivery',
    'grocery app',
    'supermarket',
    'grocery store',
    'instacart',
    'shipt',
    'amazon fresh',
    'walmart grocery',
    'grocery shopping',
    'online grocery',
    'food shopping',
    'produce',
    'grocery order',
    'grocery pickup',
    'curbside pickup',
    'personal shopper',
    'grocery marketplace',
    'quick commerce',
    'qcommerce',
    'gorillas',
    'gopuff',
    'getir',
  ],

  synonyms: [
    'grocery platform',
    'grocery service',
    'supermarket delivery',
    'grocery ordering',
    'food delivery',
    'grocery marketplace',
    'grocery app',
    'shopping delivery',
    'grocery software',
    'supermarket app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'clothing'],

  sections: [
    { id: 'frontend', name: 'Shopping Portal', enabled: true, basePath: '/', layout: 'public', description: 'Customer shopping experience' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin', description: 'Store and order management' },
    { id: 'vendor', name: 'Shopper App', enabled: true, basePath: '/shopper', requiredRole: 'shopper', layout: 'minimal', description: 'Personal shopper interface' },
  ],

  roles: [
    { id: 'admin', name: 'Store Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'shopper', name: 'Personal Shopper', level: 40, isDefault: false, accessibleSections: ['vendor'], defaultRoute: '/shopper/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'categories',
    'shopping-cart',
    'checkout',
    'appointments',
    'orders',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'discounts',
    'reviews',
  ],

  incompatibleFeatures: ['course-management', 'appointments'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a grocery delivery app like Instacart',
    'Create a supermarket ordering platform',
    'I need a grocery delivery service',
    'Build an online grocery store with delivery',
    'Create a grocery app with personal shoppers',
  ],
};
