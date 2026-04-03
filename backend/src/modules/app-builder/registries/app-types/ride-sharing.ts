/**
 * Ride Sharing & Taxi App Type Definition
 *
 * Complete definition for ride sharing and taxi booking applications.
 * Essential for taxi companies, ride-hailing services, and transportation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIDE_SHARING_APP_TYPE: AppTypeDefinition = {
  id: 'ride-sharing',
  name: 'Ride Sharing & Taxi',
  category: 'transportation',
  description: 'Ride-hailing platform with driver matching, real-time tracking, and fare calculation',
  icon: 'taxi',

  keywords: [
    'ride sharing',
    'rideshare',
    'taxi',
    'cab',
    'uber',
    'lyft',
    'grab',
    'ola',
    'didi',
    'ride hailing',
    'ride booking',
    'taxi booking',
    'driver app',
    'passenger app',
    'transportation',
    'private hire',
    'car service',
    'limo service',
    'shuttle',
    'airport transfer',
    'on-demand rides',
    'fare calculator',
    'driver matching',
    'ride tracking',
  ],

  synonyms: [
    'taxi app',
    'ride app',
    'cab booking',
    'ride platform',
    'transportation app',
    'driver platform',
    'taxi platform',
    'ride service',
    'taxi service',
    'mobility platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'food delivery'],

  sections: [
    { id: 'frontend', name: 'Rider App', enabled: true, basePath: '/', layout: 'public', description: 'Passenger ride booking' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin', description: 'Platform administration' },
    { id: 'vendor', name: 'Driver App', enabled: true, basePath: '/driver', requiredRole: 'driver', layout: 'minimal', description: 'Driver ride management' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rides' },
    { id: 'driver', name: 'Driver', level: 40, isDefault: false, accessibleSections: ['vendor'], defaultRoute: '/driver/home' },
    { id: 'rider', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
  ],

  optionalFeatures: [
    'analytics',
    'clients',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'transportation',

  defaultColorScheme: 'black',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a ride sharing app like Uber',
    'Create a taxi booking platform',
    'I need a ride-hailing app',
    'Build a driver and passenger app',
    'Create a transportation platform with tracking',
  ],
};
