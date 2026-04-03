/**
 * Last Mile Delivery App Type Definition
 *
 * Complete definition for last mile delivery and final delivery applications.
 * Essential for e-commerce fulfillment, grocery delivery, and local delivery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAST_MILE_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'last-mile-delivery',
  name: 'Last Mile Delivery',
  category: 'logistics',
  description: 'Last mile delivery platform with route optimization, driver app, real-time tracking, and customer notifications',
  icon: 'map-pin',

  keywords: [
    'last mile delivery',
    'last mile',
    'final mile delivery',
    'doorstep delivery',
    'home delivery',
    'local delivery',
    'ecommerce delivery',
    'grocery delivery',
    'same day delivery',
    'next day delivery',
    'last mile logistics',
    'delivery optimization',
    'route optimization',
    'delivery management',
    'urban delivery',
    'residential delivery',
    'parcel delivery',
    'delivery tracking',
    'delivery platform',
    'fulfillment delivery',
  ],

  synonyms: [
    'last mile delivery platform',
    'last mile delivery software',
    'final mile delivery software',
    'last mile logistics software',
    'delivery optimization platform',
    'local delivery software',
    'ecommerce delivery software',
    'route optimization software',
    'delivery management platform',
    'last mile fulfillment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'shipping company'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Track deliveries' },
    { id: 'admin', name: 'Delivery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dispatcher', layout: 'admin', description: 'Routes and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'dispatcher', name: 'Dispatcher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'driver', name: 'Delivery Driver', level: 40, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'shipment-tracking',
    'route-optimization',
    'proof-of-delivery',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'fleet-tracking',
    'carrier-integration',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'logistics',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a last mile delivery platform',
    'Create a delivery optimization app',
    'I need a final mile logistics system',
    'Build a local delivery management app',
    'Create an ecommerce delivery platform',
  ],
};
