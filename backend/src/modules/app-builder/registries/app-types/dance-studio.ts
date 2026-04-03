/**
 * Dance Studio App Type Definition
 *
 * Complete definition for dance studio and dance school applications.
 * Essential for dance studios, dance teachers, and dance schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DANCE_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'dance-studio',
  name: 'Dance Studio',
  category: 'fitness',
  description: 'Dance studio platform with class scheduling, student management, recital planning, and studio operations',
  icon: 'person-running',

  keywords: [
    'dance studio',
    'dance school',
    'dance classes',
    'ballet',
    'hip hop dance',
    'contemporary dance',
    'jazz dance',
    'tap dance',
    'ballroom dance',
    'salsa',
    'dance academy',
    'dance instructor',
    'dance lessons',
    'recital',
    'dance competition',
    'dance company',
    'choreography',
    'dancewear',
    'dance performance',
    'dance workshop',
    'dance camp',
    'mindbody dance',
  ],

  synonyms: [
    'dance studio platform',
    'dance school software',
    'dance class management',
    'dance academy app',
    'studio management',
    'dance booking system',
    'dance studio app',
    'dance lesson software',
    'dance education platform',
    'dance class booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Class registration and schedules' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Studio management and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Dance Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/classes' },
    { id: 'parent', name: 'Parent', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
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
    'reservations',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a dance studio management platform',
    'Create a dance school booking app',
    'I need a dance class registration system',
    'Build a ballet studio management software',
    'Create a dance academy app with recital planning',
  ],
};
