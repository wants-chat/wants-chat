/**
 * Vending Route App Type Definition
 *
 * Complete definition for vending machine route operations.
 * Essential for vending operators, route drivers, and machine location management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENDING_ROUTE_APP_TYPE: AppTypeDefinition = {
  id: 'vending-route',
  name: 'Vending Route',
  category: 'services',
  description: 'Vending route platform with route optimization, inventory tracking, machine monitoring, and location management',
  icon: 'vending-machine',

  keywords: [
    'vending route',
    'vending operator',
    'vending route software',
    'route management',
    'machine location',
    'vending route management',
    'route optimization',
    'vending route practice',
    'vending route scheduling',
    'inventory tracking',
    'vending route crm',
    'machine monitoring',
    'vending route business',
    'location management',
    'vending route pos',
    'snack vending',
    'vending route operations',
    'beverage vending',
    'vending route platform',
    'micro market',
  ],

  synonyms: [
    'vending route platform',
    'vending route software',
    'vending operator software',
    'route management software',
    'machine location software',
    'route optimization software',
    'vending route practice software',
    'inventory tracking software',
    'machine monitoring software',
    'snack vending software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Location Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and support' },
    { id: 'admin', name: 'Route Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Route Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'driver', name: 'Route Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/stops' },
    { id: 'location', name: 'Location Manager', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'practical',

  examplePrompts: [
    'Build a vending route platform',
    'Create a vending machine operator app',
    'I need a route management system',
    'Build a vending business app',
    'Create a vending route portal',
  ],
};
