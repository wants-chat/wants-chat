/**
 * Martial Arts School App Type Definition
 *
 * Complete definition for martial arts school and dojo operations.
 * Essential for martial arts studios, dojos, and combat sports academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARTIAL_ARTS_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'martial-arts-school',
  name: 'Martial Arts School',
  category: 'education',
  description: 'Martial arts platform with belt progression, class management, tournament tracking, and membership billing',
  icon: 'swords',

  keywords: [
    'martial arts school',
    'dojo',
    'martial arts school software',
    'karate',
    'taekwondo',
    'martial arts school management',
    'belt progression',
    'martial arts school practice',
    'martial arts school scheduling',
    'class management',
    'martial arts school crm',
    'tournament tracking',
    'martial arts school business',
    'membership billing',
    'martial arts school pos',
    'jiu jitsu',
    'martial arts school operations',
    'muay thai',
    'martial arts school platform',
    'mma',
  ],

  synonyms: [
    'martial arts school platform',
    'martial arts school software',
    'dojo software',
    'karate software',
    'taekwondo software',
    'belt progression software',
    'martial arts school practice software',
    'class management software',
    'tournament tracking software',
    'mma software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and progress' },
    { id: 'admin', name: 'Dojo Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Master/Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attendance' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'group-training',
    'fitness-challenges',
    'body-measurements',
    'workout-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a martial arts school platform',
    'Create a dojo management portal',
    'I need a karate school system',
    'Build a belt tracking platform',
    'Create a tournament management app',
  ],
};
