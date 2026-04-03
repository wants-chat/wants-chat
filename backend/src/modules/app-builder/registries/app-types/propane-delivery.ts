/**
 * Propane Delivery App Type Definition
 *
 * Complete definition for propane and fuel delivery applications.
 * Essential for propane companies, fuel distributors, and heating oil delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPANE_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'propane-delivery',
  name: 'Propane Delivery',
  category: 'energy',
  description: 'Propane delivery platform with route optimization, tank monitoring, automatic delivery, and customer management',
  icon: 'flame',

  keywords: [
    'propane delivery',
    'propane company',
    'fuel delivery',
    'propane software',
    'propane distribution',
    'heating oil delivery',
    'propane routing',
    'tank monitoring',
    'propane scheduling',
    'fuel distribution',
    'propane business',
    'propane customers',
    'automatic delivery',
    'propane billing',
    'propane dispatch',
    'bulk propane',
    'propane service',
    'fuel oil',
    'propane operations',
    'propane truck',
  ],

  synonyms: [
    'propane delivery platform',
    'propane delivery software',
    'fuel delivery software',
    'propane company software',
    'propane distribution software',
    'heating oil software',
    'propane routing software',
    'propane scheduling software',
    'fuel distribution software',
    'propane dispatch software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'propane grill'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and account' },
    { id: 'admin', name: 'Propane Dashboard', enabled: true, basePath: '/admin', requiredRole: 'driver', layout: 'admin', description: 'Routes and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'dispatcher', name: 'Dispatcher', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Delivery Driver', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
    'route-optimization',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'inventory',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'energy',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a propane delivery platform',
    'Create a fuel delivery routing app',
    'I need a propane customer management system',
    'Build a heating oil delivery app',
    'Create a propane distribution platform',
  ],
};
