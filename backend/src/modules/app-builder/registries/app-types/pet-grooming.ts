/**
 * Pet Grooming App Type Definition
 *
 * Complete definition for pet grooming and dog grooming applications.
 * Essential for pet groomers, grooming salons, and mobile groomers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_GROOMING_APP_TYPE: AppTypeDefinition = {
  id: 'pet-grooming',
  name: 'Pet Grooming',
  category: 'pets',
  description: 'Pet grooming platform with appointment booking, breed-specific services, groomer scheduling, and client pet profiles',
  icon: 'scissors',

  keywords: [
    'pet grooming',
    'dog grooming',
    'pet groomer',
    'grooming software',
    'pet salon',
    'grooming booking',
    'mobile grooming',
    'grooming appointments',
    'cat grooming',
    'grooming scheduling',
    'pet spa',
    'grooming crm',
    'grooming business',
    'breed grooming',
    'grooming pos',
    'grooming management',
    'pet haircut',
    'grooming services',
    'grooming studio',
    'pet styling',
  ],

  synonyms: [
    'pet grooming platform',
    'pet grooming software',
    'dog grooming software',
    'grooming booking software',
    'pet salon software',
    'mobile grooming software',
    'grooming scheduling software',
    'pet spa software',
    'grooming management software',
    'grooming appointment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'human hair salon'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and pet profiles' },
    { id: 'admin', name: 'Grooming Dashboard', enabled: true, basePath: '/admin', requiredRole: 'groomer', layout: 'admin', description: 'Appointments and pets' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'groomer', name: 'Groomer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a pet grooming booking platform',
    'Create a dog grooming salon app',
    'I need a mobile pet grooming system',
    'Build a pet spa management app',
    'Create a grooming appointment platform',
  ],
};
