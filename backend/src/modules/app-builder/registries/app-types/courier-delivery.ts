/**
 * Courier Delivery App Type Definition
 *
 * Complete definition for courier and delivery service applications.
 * Essential for courier companies, same-day delivery, and package delivery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COURIER_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'courier-delivery',
  name: 'Courier Delivery',
  category: 'logistics',
  description: 'Courier delivery platform with order management, driver dispatch, real-time tracking, and proof of delivery',
  icon: 'bike',

  keywords: [
    'courier delivery',
    'courier service',
    'package delivery',
    'same day delivery',
    'express delivery',
    'courier software',
    'delivery management',
    'courier tracking',
    'parcel delivery',
    'local delivery',
    'on-demand delivery',
    'courier dispatch',
    'delivery driver',
    'courier app',
    'messenger service',
    'bike courier',
    'delivery platform',
    'courier booking',
    'rush delivery',
    'instant delivery',
  ],

  synonyms: [
    'courier delivery platform',
    'courier management software',
    'delivery service software',
    'courier dispatch software',
    'package delivery platform',
    'same day delivery software',
    'courier tracking software',
    'delivery management platform',
    'on-demand delivery software',
    'courier booking platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant delivery', 'fitness', 'food delivery only'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book and track deliveries' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dispatcher', layout: 'admin', description: 'Orders and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'dispatcher', name: 'Dispatcher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Courier/Driver', level: 40, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'notifications',
    'search',
    'shipment-tracking',
    'route-optimization',
    'proof-of-delivery',
  ],

  optionalFeatures: [
    'payments',
    'clients',
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a courier delivery platform',
    'Create a same-day delivery app',
    'I need a courier management system',
    'Build a package delivery service',
    'Create a courier dispatch app',
  ],
};
