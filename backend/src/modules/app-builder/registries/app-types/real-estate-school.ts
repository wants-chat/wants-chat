/**
 * Real Estate School App Type Definition
 *
 * Complete definition for real estate licensing education operations.
 * Essential for real estate schools, broker training, and property licensing programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-school',
  name: 'Real Estate School',
  category: 'education',
  description: 'Real estate school platform with licensing courses, exam prep, continuing education, and state compliance tracking',
  icon: 'graduation-cap',

  keywords: [
    'real estate school',
    'broker training',
    'real estate school software',
    'licensing education',
    'agent training',
    'real estate school management',
    'licensing courses',
    'real estate school practice',
    'real estate school scheduling',
    'exam prep',
    'real estate school crm',
    'continuing education',
    'real estate school business',
    'state compliance',
    'real estate school pos',
    'pre-licensing',
    'real estate school operations',
    'post-licensing',
    'real estate school platform',
    'broker license',
  ],

  synonyms: [
    'real estate school platform',
    'real estate school software',
    'broker training software',
    'licensing education software',
    'agent training software',
    'licensing courses software',
    'real estate school practice software',
    'exam prep software',
    'continuing education software',
    'pre-licensing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and exams' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Enrollments and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courses' },
    { id: 'staff', name: 'Enrollment Advisor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'messaging',
    'documents',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'mls-integration',
    'virtual-tours',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a real estate school platform',
    'Create a broker training portal',
    'I need a licensing education system',
    'Build an exam prep platform',
    'Create a real estate CE app',
  ],
};
