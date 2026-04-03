/**
 * Music Lessons App Type Definition
 *
 * Complete definition for music lesson booking and teaching applications.
 * Essential for music teachers, music schools, and instrument instructors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'music-lessons',
  name: 'Music Lessons',
  category: 'education',
  description: 'Music lesson platform with teacher booking, student management, lesson scheduling, and practice tracking',
  icon: 'music',

  keywords: [
    'music lessons',
    'music teacher',
    'music school',
    'piano lessons',
    'guitar lessons',
    'voice lessons',
    'violin lessons',
    'drum lessons',
    'takelessons',
    'lessonface',
    'music education',
    'instrument lessons',
    'music tutor',
    'private lessons',
    'online music lessons',
    'music academy',
    'music instructor',
    'songwriting lessons',
    'music theory',
    'band lessons',
    'orchestra',
    'recital',
  ],

  synonyms: [
    'music lesson platform',
    'music teaching software',
    'music school app',
    'lesson booking app',
    'music instructor software',
    'music academy platform',
    'music education app',
    'instrument teaching',
    'music tutor app',
    'lesson management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find teachers and book lessons' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin', description: 'School administration' },
    { id: 'vendor', name: 'Teacher Dashboard', enabled: true, basePath: '/teacher', requiredRole: 'teacher', layout: 'admin', description: 'Lesson and student management' },
  ],

  roles: [
    { id: 'admin', name: 'School Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'teacher', name: 'Music Teacher', level: 60, isDefault: false, accessibleSections: ['frontend', 'vendor'], defaultRoute: '/teacher/schedule' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/lessons' },
    { id: 'parent', name: 'Parent', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'messaging',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reservations',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a music lesson booking platform',
    'Create a music school management app',
    'I need a platform for music teachers',
    'Build an online music lessons marketplace',
    'Create a music academy software',
  ],
};
