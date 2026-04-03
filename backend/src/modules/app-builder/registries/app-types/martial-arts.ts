/**
 * Martial Arts App Type Definition
 *
 * Complete definition for martial arts school and dojo applications.
 * Essential for martial arts studios, dojos, and combat sports academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARTIAL_ARTS_APP_TYPE: AppTypeDefinition = {
  id: 'martial-arts',
  name: 'Martial Arts',
  category: 'fitness',
  description: 'Martial arts studio platform with class scheduling, belt ranking, student management, and tournament tracking',
  icon: 'hand-fist',

  keywords: [
    'martial arts',
    'karate',
    'taekwondo',
    'jiu jitsu',
    'bjj',
    'judo',
    'kickboxing',
    'muay thai',
    'mma',
    'kung fu',
    'aikido',
    'krav maga',
    'dojo',
    'martial arts school',
    'martial arts studio',
    'belt ranking',
    'sparring',
    'tournament',
    'self defense',
    'kids martial arts',
    'martial arts training',
    'combat sports',
  ],

  synonyms: [
    'martial arts platform',
    'dojo software',
    'martial arts management',
    'karate school app',
    'bjj academy software',
    'martial arts booking',
    'dojo management',
    'martial arts school app',
    'combat sports platform',
    'martial arts studio software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Class registration and progress tracking' },
    { id: 'admin', name: 'Dojo Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'School management and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'School Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Head Instructor', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/students' },
    { id: 'assistant', name: 'Assistant Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
    { id: 'parent', name: 'Parent', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'group-training',
    'fitness-challenges',
    'body-measurements',
    'workout-tracking',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a martial arts school management platform',
    'Create a karate dojo booking app',
    'I need a BJJ academy management system',
    'Build a martial arts studio with belt tracking',
    'Create a taekwondo school app',
  ],
};
