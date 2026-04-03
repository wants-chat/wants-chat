/**
 * Language School App Type Definition
 *
 * Complete definition for language school and language learning applications.
 * Essential for language schools, ESL programs, and language tutoring centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LANGUAGE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'language-school',
  name: 'Language School',
  category: 'education',
  description: 'Language school platform with class booking, placement tests, progress tracking, and conversation practice',
  icon: 'languages',

  keywords: [
    'language school',
    'language classes',
    'language learning',
    'esl school',
    'english school',
    'spanish classes',
    'french classes',
    'german classes',
    'mandarin classes',
    'language academy',
    'language courses',
    'language tutor',
    'foreign language',
    'second language',
    'language immersion',
    'conversation class',
    'grammar class',
    'toefl prep',
    'ielts prep',
    'language certification',
    'business english',
  ],

  synonyms: [
    'language school platform',
    'language school software',
    'language learning platform',
    'esl software',
    'language education app',
    'language class booking',
    'language academy software',
    'language tutor app',
    'language course management',
    'language training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book classes and practice' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'teacher', layout: 'admin', description: 'Classes and student progress' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Academic Coordinator', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/curriculum' },
    { id: 'teacher', name: 'Language Teacher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'tutor', name: 'Conversation Tutor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'course-management',
    'student-records',
    'attendance',
    'class-roster',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'analytics',
    'certificates',
    'transcripts',
    'enrollment',
    'lms',
    'assignments',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a language school booking platform',
    'Create an ESL class scheduling app',
    'I need a language academy management system',
    'Build a language learning platform with progress tracking',
    'Create a language school with placement tests',
  ],
};
