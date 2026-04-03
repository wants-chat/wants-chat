/**
 * Music School App Type Definition
 *
 * Complete definition for music school and conservatory operations.
 * Essential for music schools, conservatories, and private music studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'music-school',
  name: 'Music School',
  category: 'education',
  description: 'Music school platform with lesson scheduling, student progress, recital management, and practice tracking',
  icon: 'music',

  keywords: [
    'music school',
    'conservatory',
    'music school software',
    'music lessons',
    'private studio',
    'music school management',
    'lesson scheduling',
    'music school practice',
    'music school scheduling',
    'student progress',
    'music school crm',
    'recital management',
    'music school business',
    'practice tracking',
    'music school pos',
    'piano lessons',
    'music school operations',
    'guitar lessons',
    'music school platform',
    'music theory',
  ],

  synonyms: [
    'music school platform',
    'music school software',
    'conservatory software',
    'music lessons software',
    'private studio software',
    'lesson scheduling software',
    'music school practice software',
    'student progress software',
    'recital management software',
    'practice tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedule and students' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'teacher', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/students' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'attendance',
    'class-roster',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
    'course-management',
    'enrollment',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a music school platform',
    'Create a conservatory portal',
    'I need a music lesson management system',
    'Build a student progress platform',
    'Create a recital scheduling app',
  ],
};
