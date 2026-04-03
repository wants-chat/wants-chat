/**
 * Senior Fitness App Type Definition
 *
 * Complete definition for senior fitness programs and wellness centers.
 * Essential for senior fitness classes, active aging programs, and wellness facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'senior-fitness',
  name: 'Senior Fitness',
  category: 'seniors',
  description: 'Senior fitness platform with class scheduling, health tracking, exercise modifications, and progress monitoring',
  icon: 'dumbbell',

  keywords: [
    'senior fitness',
    'senior exercise',
    'senior fitness software',
    'active aging',
    'senior wellness',
    'senior fitness management',
    'elderly fitness',
    'senior gym',
    'senior fitness scheduling',
    'silver sneakers',
    'senior fitness crm',
    'chair exercise',
    'senior fitness business',
    'low impact',
    'senior fitness pos',
    'balance classes',
    'senior fitness operations',
    'fall prevention',
    'senior fitness services',
    'gentle fitness',
  ],

  synonyms: [
    'senior fitness platform',
    'senior fitness software',
    'senior exercise software',
    'active aging software',
    'senior wellness software',
    'elderly fitness software',
    'senior gym software',
    'silver sneakers software',
    'senior fitness class software',
    'gentle fitness software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'crossfit', 'bodybuilding'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and progress' },
    { id: 'admin', name: 'Fitness Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Members and classes' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Wellness Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Fitness Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'body-measurements',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'group-training',
    'class-packages',
    'workout-tracking',
    'nutrition-tracking',
    'fitness-challenges',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'seniors',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a senior fitness program platform',
    'Create a senior wellness class app',
    'I need an active aging fitness system',
    'Build a senior exercise scheduling platform',
    'Create a gentle fitness class app',
  ],
};
