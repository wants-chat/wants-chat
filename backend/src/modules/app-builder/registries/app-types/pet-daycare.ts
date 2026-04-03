/**
 * Pet Daycare App Type Definition
 *
 * Complete definition for pet daycare operations.
 * Essential for doggy daycares, pet play centers, and animal care facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_DAYCARE_APP_TYPE: AppTypeDefinition = {
  id: 'pet-daycare',
  name: 'Pet Daycare',
  category: 'services',
  description: 'Pet daycare platform with reservation management, check-in/out, activity tracking, and report cards',
  icon: 'paw-print',

  keywords: [
    'pet daycare',
    'doggy daycare',
    'pet daycare software',
    'pet play center',
    'animal care',
    'pet daycare management',
    'reservation management',
    'pet daycare practice',
    'pet daycare scheduling',
    'check-in tracking',
    'pet daycare crm',
    'activity tracking',
    'pet daycare business',
    'report cards',
    'pet daycare pos',
    'play groups',
    'pet daycare operations',
    'webcam viewing',
    'pet daycare platform',
    'enrichment activities',
  ],

  synonyms: [
    'pet daycare platform',
    'pet daycare software',
    'doggy daycare software',
    'pet play center software',
    'animal care software',
    'reservation management software',
    'pet daycare practice software',
    'activity tracking software',
    'report cards software',
    'enrichment activities software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reservations and updates' },
    { id: 'admin', name: 'Daycare Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Pets and activities' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Daycare Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'attendant', name: 'Pet Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'client', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'crm',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a pet daycare platform',
    'Create a doggy daycare portal',
    'I need a pet daycare management system',
    'Build a reservation management platform',
    'Create an activity tracking and report card app',
  ],
};
