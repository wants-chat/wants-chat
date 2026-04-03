/**
 * Pet Taxi App Type Definition
 *
 * Complete definition for pet taxi service operations.
 * Essential for pet transport services, animal taxi companies, and pet chauffeur services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_TAXI_APP_TYPE: AppTypeDefinition = {
  id: 'pet-taxi',
  name: 'Pet Taxi',
  category: 'transportation',
  description: 'Pet taxi platform with ride booking, vehicle tracking, driver management, and pet profile handling',
  icon: 'car',

  keywords: [
    'pet taxi',
    'pet transport',
    'pet taxi software',
    'animal taxi',
    'pet chauffeur',
    'pet taxi management',
    'ride booking',
    'pet taxi practice',
    'pet taxi scheduling',
    'vehicle tracking',
    'pet taxi crm',
    'driver management',
    'pet taxi business',
    'pet profile handling',
    'pet taxi pos',
    'vet appointments',
    'pet taxi operations',
    'groomer transport',
    'pet taxi platform',
    'airport pet transport',
  ],

  synonyms: [
    'pet taxi platform',
    'pet taxi software',
    'pet transport software',
    'animal taxi software',
    'pet chauffeur software',
    'ride booking software',
    'pet taxi practice software',
    'vehicle tracking software',
    'driver management software',
    'vet appointments software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rides and tracking' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Drivers and rides' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rides' },
    { id: 'driver', name: 'Pet Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-rides' },
    { id: 'customer', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'transportation',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet taxi platform',
    'Create a pet transport service app',
    'I need an animal taxi booking system',
    'Build a pet chauffeur service app',
    'Create a pet taxi portal',
  ],
};
