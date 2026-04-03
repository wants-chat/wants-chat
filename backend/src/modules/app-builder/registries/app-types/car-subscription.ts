/**
 * Car Subscription App Type Definition
 *
 * Complete definition for car subscription service operations.
 * Essential for vehicle subscription services, car-as-a-service, and flexible mobility.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'car-subscription',
  name: 'Car Subscription',
  category: 'automotive',
  description: 'Car subscription platform with vehicle selection, subscription management, swap scheduling, and usage tracking',
  icon: 'refresh-cw',

  keywords: [
    'car subscription',
    'vehicle subscription',
    'car subscription software',
    'car as a service',
    'flexible mobility',
    'car subscription management',
    'vehicle selection',
    'car subscription practice',
    'car subscription scheduling',
    'subscription management',
    'car subscription crm',
    'swap scheduling',
    'car subscription business',
    'usage tracking',
    'car subscription pos',
    'all-inclusive',
    'car subscription operations',
    'fleet rotation',
    'car subscription platform',
    'monthly car',
  ],

  synonyms: [
    'car subscription platform',
    'car subscription software',
    'vehicle subscription software',
    'car as a service software',
    'flexible mobility software',
    'vehicle selection software',
    'car subscription practice software',
    'subscription management software',
    'swap scheduling software',
    'fleet rotation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Vehicles and swaps' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and subscribers' },
  ],

  roles: [
    { id: 'admin', name: 'Service Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Fleet Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/fleet' },
    { id: 'concierge', name: 'Concierge', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'vehicle-inventory',
    'service-scheduling',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'recalls-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a car subscription platform',
    'Create a vehicle subscription portal',
    'I need a car-as-a-service system',
    'Build a flexible car access platform',
    'Create a subscription mobility app',
  ],
};
