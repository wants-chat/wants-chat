/**
 * Meal Kit App Type Definition
 *
 * Complete definition for meal kit subscription services.
 * Essential for meal kit companies, recipe boxes, and food subscription.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEAL_KIT_APP_TYPE: AppTypeDefinition = {
  id: 'meal-kit',
  name: 'Meal Kit',
  category: 'subscription',
  description: 'Meal kit platform with menu planning, subscription management, delivery scheduling, and recipe library',
  icon: 'utensils',

  keywords: [
    'meal kit',
    'recipe box',
    'meal kit software',
    'food subscription',
    'meal delivery',
    'meal kit management',
    'menu planning',
    'meal kit practice',
    'meal kit scheduling',
    'subscription management',
    'meal kit crm',
    'ingredient boxes',
    'meal kit business',
    'dietary options',
    'meal kit pos',
    'family meals',
    'meal kit operations',
    'cooking instructions',
    'meal kit platform',
    'weekly delivery',
  ],

  synonyms: [
    'meal kit platform',
    'meal kit software',
    'recipe box software',
    'food subscription software',
    'meal delivery software',
    'menu planning software',
    'meal kit practice software',
    'subscription management software',
    'ingredient boxes software',
    'weekly delivery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Menus and orders' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/packing' },
    { id: 'customer', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a meal kit subscription platform',
    'Create a recipe box delivery portal',
    'I need a food subscription management system',
    'Build a meal delivery subscription platform',
    'Create a menu and subscription app',
  ],
};
