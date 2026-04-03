/**
 * Pizzeria App Type Definition
 *
 * Complete definition for pizzeria and pizza delivery applications.
 * Essential for pizza restaurants, pizza delivery, and pizza chains.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIZZERIA_APP_TYPE: AppTypeDefinition = {
  id: 'pizzeria',
  name: 'Pizzeria',
  category: 'food-beverage',
  description: 'Pizzeria platform with pizza builder, online ordering, delivery tracking, and loyalty rewards',
  icon: 'pizza',

  keywords: [
    'pizzeria',
    'pizza restaurant',
    'pizza shop',
    'pizza delivery',
    'pizza ordering',
    'pizza builder',
    'pizza menu',
    'pizza chain',
    'pizza app',
    'build your pizza',
    'pizza toppings',
    'pizza deals',
    'pizza pickup',
    'pizza tracker',
    'wood-fired pizza',
    'artisan pizza',
    'pizza catering',
    'pizza party',
    'pizza slice',
    'pizza franchise',
  ],

  synonyms: [
    'pizzeria platform',
    'pizza ordering software',
    'pizza restaurant software',
    'pizza delivery software',
    'pizza pos',
    'pizza shop software',
    'pizza management software',
    'pizza builder software',
    'pizza chain software',
    'pizza franchise software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'italian full restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Build pizza and order' },
    { id: 'admin', name: 'Pizza Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Orders and menu' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'kitchen', name: 'Kitchen Staff', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/kitchen' },
    { id: 'driver', name: 'Delivery Driver', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'kitchen-display',
    'pos-system',
    'orders',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'table-reservations',
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a pizzeria ordering platform',
    'Create a pizza delivery app',
    'I need a pizza builder with delivery',
    'Build a pizza restaurant system',
    'Create a pizza chain management app',
  ],
};
