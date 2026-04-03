/**
 * Kids Tutoring App Type Definition
 *
 * Complete definition for kids tutoring and academic support.
 * Essential for tutoring centers, learning centers, and academic enrichment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'kids-tutoring',
  name: 'Kids Tutoring',
  category: 'children',
  description: 'Kids tutoring platform with session booking, progress tracking, tutor matching, and parent reporting',
  icon: 'graduation-cap',

  keywords: [
    'kids tutoring',
    'tutoring center',
    'tutoring software',
    'academic support',
    'tutoring booking',
    'tutoring management',
    'learning center',
    'homework help',
    'tutoring scheduling',
    'math tutoring',
    'tutoring crm',
    'reading tutoring',
    'tutoring business',
    'test prep kids',
    'tutoring pos',
    'subject tutoring',
    'tutoring operations',
    'academic enrichment',
    'tutoring services',
    'learning support',
  ],

  synonyms: [
    'kids tutoring platform',
    'kids tutoring software',
    'tutoring center software',
    'academic support software',
    'tutoring booking software',
    'learning center software',
    'tutoring management software',
    'tutoring scheduling software',
    'academic enrichment software',
    'homework help software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'adult education'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and progress' },
    { id: 'admin', name: 'Tutoring Dashboard', enabled: true, basePath: '/admin', requiredRole: 'tutor', layout: 'admin', description: 'Students and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'tutor', name: 'Tutor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'assignments',
    'grading',
    'parent-portal',
    'attendance',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'documents',
    'reminders',
    'reporting',
    'certificates',
    'transcripts',
    'course-management',
    'class-roster',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a kids tutoring platform',
    'Create a tutoring center booking app',
    'I need a learning center management system',
    'Build an academic support scheduling platform',
    'Create a homework help tutoring app',
  ],
};
