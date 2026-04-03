/**
 * Dog Grooming App Type Definition
 *
 * Complete definition for dog grooming salon operations.
 * Essential for pet groomers, dog spas, and mobile grooming services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOG_GROOMING_APP_TYPE: AppTypeDefinition = {
  id: 'dog-grooming',
  name: 'Dog Grooming',
  category: 'services',
  description: 'Dog grooming platform with appointment scheduling, breed-specific services, customer profiles, and grooming history tracking',
  icon: 'scissors',

  keywords: [
    'dog grooming',
    'pet grooming',
    'dog grooming software',
    'dog spa',
    'pet salon',
    'dog grooming management',
    'appointment scheduling',
    'dog grooming practice',
    'dog grooming scheduling',
    'breed services',
    'dog grooming crm',
    'grooming history',
    'dog grooming business',
    'mobile grooming',
    'dog grooming pos',
    'pet styling',
    'dog grooming operations',
    'bath trim',
    'dog grooming platform',
    'nail trimming',
  ],

  synonyms: [
    'dog grooming platform',
    'dog grooming software',
    'pet grooming software',
    'dog spa software',
    'pet salon software',
    'appointment scheduling software',
    'dog grooming practice software',
    'breed services software',
    'grooming history software',
    'mobile grooming software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and profiles' },
    { id: 'admin', name: 'Grooming Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Salon Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'groomer', name: 'Groomer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'customer', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'discounts',
    'reminders',
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a dog grooming platform',
    'Create a pet grooming salon app',
    'I need a dog spa booking system',
    'Build a mobile pet grooming platform',
    'Create a dog grooming business app',
  ],
};
