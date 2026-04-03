/**
 * Tutoring Center App Type Definition
 *
 * Complete definition for tutoring center and learning center operations.
 * Essential for tutoring centers, learning centers, and academic coaching.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUTORING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'tutoring-center',
  name: 'Tutoring Center',
  category: 'education',
  description: 'Tutoring center platform with tutor matching, session scheduling, progress tracking, and curriculum alignment',
  icon: 'book-open',

  keywords: [
    'tutoring center',
    'learning center',
    'tutoring center software',
    'academic coaching',
    'homework help',
    'tutoring center management',
    'tutor matching',
    'tutoring center practice',
    'tutoring center scheduling',
    'session scheduling',
    'tutoring center crm',
    'progress tracking',
    'tutoring center business',
    'curriculum alignment',
    'tutoring center pos',
    'test prep',
    'tutoring center operations',
    'subject tutoring',
    'tutoring center platform',
    'study skills',
  ],

  synonyms: [
    'tutoring center platform',
    'tutoring center software',
    'learning center software',
    'academic coaching software',
    'homework help software',
    'tutor matching software',
    'tutoring center practice software',
    'session scheduling software',
    'progress tracking software',
    'test prep software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and progress' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tutors and students' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'tutor', name: 'Tutor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'coordinator', name: 'Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'student', name: 'Student/Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'analytics',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'assignments',
    'grading',
    'attendance',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'certificates',
    'transcripts',
    'course-management',
    'enrollment',
    'parent-portal',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a tutoring center platform',
    'Create a learning center portal',
    'I need a tutor management system',
    'Build a session scheduling platform',
    'Create a progress tracking app',
  ],
};
