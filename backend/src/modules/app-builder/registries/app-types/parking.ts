/**
 * Parking Management App Type Definition
 *
 * Complete definition for parking management and booking applications.
 * Essential for parking lots, garages, and municipalities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARKING_APP_TYPE: AppTypeDefinition = {
  id: 'parking',
  name: 'Parking Management',
  category: 'transportation',
  description: 'Parking platform with spot booking, payments, and facility management',
  icon: 'square-parking',

  keywords: [
    'parking',
    'parking management',
    'parking lot',
    'parking garage',
    'parking booking',
    'parking reservation',
    'spothero',
    'parkwhiz',
    'parkme',
    'parkmobile',
    'parking app',
    'parking meter',
    'valet',
    'parking permit',
    'monthly parking',
    'hourly parking',
    'airport parking',
    'event parking',
    'street parking',
    'parking enforcement',
    'parking sensors',
    'smart parking',
  ],

  synonyms: [
    'parking platform',
    'parking software',
    'parking app',
    'parking system',
    'parking solution',
    'parking booking system',
    'parking management system',
    'parking reservation system',
    'valet system',
    'parking operator',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Driver Portal', enabled: true, basePath: '/', layout: 'public', description: 'Parking search and booking' },
    { id: 'admin', name: 'Operator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Facility management' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'operator', name: 'Facility Operator', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/facilities' },
    { id: 'attendant', name: 'Attendant', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'driver', name: 'Driver', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/search' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
  ],

  optionalFeatures: [
    'reservations',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'transportation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a parking booking app',
    'Create a parking management system',
    'I need a parking reservation platform like SpotHero',
    'Build a smart parking solution',
    'Create a parking app with real-time availability',
  ],
};
