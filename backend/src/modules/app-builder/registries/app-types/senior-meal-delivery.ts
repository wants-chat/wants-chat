/**
 * Senior Meal Delivery App Type Definition
 *
 * Complete definition for senior meal delivery and nutrition services.
 * Essential for Meals on Wheels, senior nutrition programs, and home-delivered meals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_MEAL_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'senior-meal-delivery',
  name: 'Senior Meal Delivery',
  category: 'seniors',
  description: 'Senior meal delivery platform with route optimization, dietary tracking, volunteer management, and wellness checks',
  icon: 'utensils',

  keywords: [
    'senior meals',
    'meals on wheels',
    'senior meal delivery software',
    'home delivered meals',
    'senior nutrition',
    'senior meal management',
    'elderly meals',
    'meal delivery',
    'senior meal scheduling',
    'congregate meals',
    'senior meal crm',
    'nutrition program',
    'senior meal business',
    'meal routes',
    'senior meal pos',
    'dietary needs',
    'senior meal operations',
    'meal volunteers',
    'senior meal services',
    'nutrition assistance',
  ],

  synonyms: [
    'senior meal delivery platform',
    'senior meal delivery software',
    'meals on wheels software',
    'home delivered meals software',
    'senior nutrition software',
    'elderly meals software',
    'meal delivery software',
    'congregate meals software',
    'nutrition program software',
    'meal route software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant general'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Meals and schedule' },
    { id: 'admin', name: 'Program Dashboard', enabled: true, basePath: '/admin', requiredRole: 'volunteer', layout: 'admin', description: 'Routes and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'volunteer', name: 'Delivery Volunteer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'client', name: 'Meal Recipient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'team-management',
    'invoicing',
    'notifications',
    'search',
    'route-optimization',
  ],

  optionalFeatures: [
    'kitchen-display',
    'payments',
    'reporting',
    'analytics',
    'fleet-tracking',
    'proof-of-delivery',
    'shipment-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'seniors',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a senior meal delivery platform',
    'Create a Meals on Wheels management app',
    'I need a home-delivered meals routing system',
    'Build a senior nutrition program platform',
    'Create a meal volunteer management app',
  ],
};
