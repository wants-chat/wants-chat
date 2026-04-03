/**
 * Pet Food Delivery App Type Definition
 *
 * Complete definition for pet food delivery service operations.
 * Essential for pet food subscription services, delivery companies, and specialty pet food retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_FOOD_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'pet-food-delivery',
  name: 'Pet Food Delivery',
  category: 'retail',
  description: 'Pet food delivery platform with subscription management, product catalog, delivery scheduling, and auto-reorder',
  icon: 'truck',

  keywords: [
    'pet food delivery',
    'pet subscription',
    'pet food delivery software',
    'pet supplies delivery',
    'dog food delivery',
    'pet food delivery management',
    'subscription management',
    'pet food delivery practice',
    'pet food delivery scheduling',
    'product catalog',
    'pet food delivery crm',
    'delivery scheduling',
    'pet food delivery business',
    'auto-reorder',
    'pet food delivery pos',
    'cat food delivery',
    'pet food delivery operations',
    'fresh pet food',
    'pet food delivery platform',
    'raw diet',
  ],

  synonyms: [
    'pet food delivery platform',
    'pet food delivery software',
    'pet subscription software',
    'pet supplies delivery software',
    'dog food delivery software',
    'subscription management software',
    'pet food delivery practice software',
    'product catalog software',
    'delivery scheduling software',
    'fresh pet food software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and subscriptions' },
    { id: 'admin', name: 'Delivery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'driver', name: 'Delivery Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'customer', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'product-catalog',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'shipment-tracking',
    'fleet-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet food delivery platform',
    'Create a pet subscription app',
    'I need a pet supplies delivery system',
    'Build a dog food subscription app',
    'Create a pet food delivery portal',
  ],
};
