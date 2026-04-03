/**
 * Swim School App Type Definition
 *
 * Complete definition for swim schools and aquatic lessons.
 * Essential for swim schools, aquatic centers, and swimming instruction.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIM_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'swim-school',
  name: 'Swim School',
  category: 'children',
  description: 'Swim school platform with lesson scheduling, skill progression tracking, instructor management, and makeup classes',
  icon: 'waves',

  keywords: [
    'swim school',
    'swimming lessons',
    'swim school software',
    'aquatic lessons',
    'swim instruction',
    'swim school management',
    'kids swimming',
    'swim scheduling',
    'swim levels',
    'learn to swim',
    'swim school crm',
    'water safety',
    'swim school business',
    'pool lessons',
    'swim school pos',
    'swim team',
    'swim school operations',
    'infant swim',
    'swim school services',
    'aquatic program',
  ],

  synonyms: [
    'swim school platform',
    'swim school software',
    'swimming lessons software',
    'aquatic lessons software',
    'swim instruction software',
    'swim school management software',
    'kids swimming software',
    'swim scheduling software',
    'learn to swim software',
    'aquatic program software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness adults', 'competitive swimming'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and progress' },
    { id: 'admin', name: 'Swim Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Students and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Swim Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a swim school platform',
    'Create a swimming lessons app',
    'I need a swim instruction scheduling system',
    'Build a learn to swim program app',
    'Create an aquatic lessons platform',
  ],
};
