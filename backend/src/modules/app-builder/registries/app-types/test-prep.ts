/**
 * Test Prep App Type Definition
 *
 * Complete definition for test preparation and exam coaching applications.
 * Essential for test prep centers, tutoring services, and exam preparation courses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEST_PREP_APP_TYPE: AppTypeDefinition = {
  id: 'test-prep',
  name: 'Test Prep',
  category: 'education',
  description: 'Test prep platform with practice tests, tutoring sessions, score tracking, and study schedules',
  icon: 'clipboard-check',

  keywords: [
    'test prep',
    'sat prep',
    'act prep',
    'gre prep',
    'gmat prep',
    'lsat prep',
    'mcat prep',
    'bar exam prep',
    'test preparation',
    'exam prep',
    'standardized test',
    'practice tests',
    'test tutoring',
    'score improvement',
    'kaplan',
    'princeton review',
    'test taking',
    'study guide',
    'exam coaching',
    'college prep',
    'graduate test prep',
  ],

  synonyms: [
    'test prep platform',
    'test prep software',
    'exam preparation software',
    'test prep app',
    'standardized test prep',
    'test coaching app',
    'exam prep platform',
    'test preparation software',
    'study prep app',
    'test tutoring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Study and take practice tests' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'tutor', layout: 'admin', description: 'Students and content' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'content', name: 'Content Manager', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/content' },
    { id: 'tutor', name: 'Tutor', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
    { id: 'parent', name: 'Parent', level: 15, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/parent' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'student-records',
    'assignments',
    'grading',
    'course-management',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'certificates',
    'transcripts',
    'lms',
    'parent-portal',
    'attendance',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'academic',

  examplePrompts: [
    'Build a test prep platform',
    'Create an SAT/ACT prep tutoring app',
    'I need a standardized test practice system',
    'Build a test prep center with score tracking',
    'Create a GMAT/GRE prep platform',
  ],
};
