/**
 * Meal Delivery Seniors App Type Definition
 *
 * Complete definition for senior meal delivery operations.
 * Essential for meals on wheels, senior nutrition programs, and elder meal services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEAL_DELIVERY_SENIORS_APP_TYPE: AppTypeDefinition = {
  id: 'meal-delivery-seniors',
  name: 'Meal Delivery Seniors',
  category: 'services',
  description: 'Senior meal delivery platform with route optimization, dietary management, wellness checks, and volunteer coordination',
  icon: 'utensils',

  keywords: [
    'meal delivery seniors',
    'meals on wheels',
    'meal delivery seniors software',
    'senior nutrition',
    'elder meals',
    'meal delivery seniors management',
    'route optimization',
    'meal delivery seniors practice',
    'meal delivery seniors scheduling',
    'dietary management',
    'meal delivery seniors crm',
    'wellness checks',
    'meal delivery seniors business',
    'volunteer coordination',
    'meal delivery seniors pos',
    'congregate meals',
    'meal delivery seniors operations',
    'home delivered meals',
    'meal delivery seniors platform',
    'nutrition program',
  ],

  synonyms: [
    'meal delivery seniors platform',
    'meal delivery seniors software',
    'meals on wheels software',
    'senior nutrition software',
    'elder meals software',
    'route optimization software',
    'meal delivery seniors practice software',
    'dietary management software',
    'wellness checks software',
    'congregate meals software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant-dine-in', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Meals and schedules' },
    { id: 'admin', name: 'Delivery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and volunteers' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Meal Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'volunteer', name: 'Volunteer Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'client', name: 'Senior Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a senior meal delivery platform',
    'Create a meals on wheels app',
    'I need an elder nutrition delivery system',
    'Build a senior meal program platform',
    'Create a home delivered meals app',
  ],
};
