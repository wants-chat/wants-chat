/**
 * CrossFit Gym App Type Definition
 *
 * Complete definition for CrossFit boxes and functional fitness facilities.
 * Essential for CrossFit affiliates, functional fitness gyms, and HIIT studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CROSSFIT_GYM_APP_TYPE: AppTypeDefinition = {
  id: 'crossfit-gym',
  name: 'CrossFit Gym',
  category: 'sports',
  description: 'CrossFit gym platform with WOD tracking, benchmark scoring, class reservations, and athlete performance analytics',
  icon: 'dumbbell',

  keywords: [
    'crossfit gym',
    'crossfit box',
    'crossfit gym software',
    'functional fitness',
    'HIIT studio',
    'crossfit gym management',
    'WOD tracking',
    'crossfit gym practice',
    'crossfit gym scheduling',
    'benchmark scores',
    'crossfit gym crm',
    'open workouts',
    'crossfit gym business',
    'class reservations',
    'crossfit gym pos',
    'strength training',
    'crossfit gym operations',
    'athlete performance',
    'crossfit gym services',
    'functional training',
  ],

  synonyms: [
    'crossfit gym platform',
    'crossfit gym software',
    'crossfit box software',
    'functional fitness software',
    'HIIT studio software',
    'WOD tracking software',
    'crossfit gym practice software',
    'benchmark scores software',
    'class reservations software',
    'functional training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Athlete Portal', enabled: true, basePath: '/', layout: 'public', description: 'WODs and classes' },
    { id: 'admin', name: 'Box Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Athletes and programming' },
  ],

  roles: [
    { id: 'admin', name: 'Box Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Head Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programming' },
    { id: 'staff', name: 'Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'athlete', name: 'Athlete', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'workout-tracking',
    'body-measurements',
    'group-training',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'trainer-booking',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'equipment-booking',
    'analytics',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a CrossFit gym platform',
    'Create a functional fitness box portal',
    'I need a CrossFit box management system',
    'Build a CrossFit affiliate platform',
    'Create a WOD tracking and scoring app',
  ],
};
