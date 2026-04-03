/**
 * Gym & Fitness Center App Type Definition
 *
 * Complete definition for gym and fitness center applications.
 * Essential for gyms, fitness centers, health clubs, and recreation centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GYM_APP_TYPE: AppTypeDefinition = {
  id: 'gym',
  name: 'Gym & Fitness Center',
  category: 'fitness',
  description: 'Gym management platform with memberships, class booking, check-in, and facility management',
  icon: 'building',

  keywords: [
    'gym',
    'fitness center',
    'health club',
    'gym management',
    'planet fitness',
    'la fitness',
    'equinox',
    'gold gym',
    'anytime fitness',
    'crossfit',
    'boutique fitness',
    'gym membership',
    'fitness studio',
    'rec center',
    'gym software',
    'gym check-in',
    'fitness club',
    'workout facility',
    'athletic club',
    'sports club',
    'wellness center',
    'gym classes',
  ],

  synonyms: [
    'gym platform',
    'fitness center software',
    'gym management system',
    'health club software',
    'gym membership app',
    'fitness club platform',
    'gym booking system',
    'fitness facility software',
    'gym app',
    'health club management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Member access and class booking' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Gym operations and member management' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Gym Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'trainer', name: 'Trainer', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'workout-tracking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'body-measurements',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'equipment-booking',
    'group-training',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'fitness',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'energetic',

  examplePrompts: [
    'Build a gym management platform',
    'Create a fitness center membership app',
    'I need a gym check-in and class booking system',
    'Build a health club management software',
    'Create a gym app like Planet Fitness',
  ],
};
