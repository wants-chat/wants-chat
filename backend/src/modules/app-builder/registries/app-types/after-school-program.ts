/**
 * After School Program App Type Definition
 *
 * Complete definition for after school programs and enrichment activities.
 * Essential for after school care, enrichment programs, and extended learning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AFTER_SCHOOL_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'after-school-program',
  name: 'After School Program',
  category: 'children',
  description: 'After school program platform with enrollment management, activity scheduling, pickup tracking, and parent communication',
  icon: 'book',

  keywords: [
    'after school program',
    'after school care',
    'after school software',
    'enrichment program',
    'extended care',
    'after school management',
    'homework help',
    'after school activities',
    'after school scheduling',
    'tutoring program',
    'after school crm',
    'stem programs',
    'after school business',
    'arts programs',
    'after school pos',
    'clubs',
    'after school operations',
    'extended learning',
    'after school services',
    'youth programs',
  ],

  synonyms: [
    'after school program platform',
    'after school program software',
    'after school care software',
    'enrichment program software',
    'extended care software',
    'after school management software',
    'after school activity software',
    'youth program software',
    'after school scheduling software',
    'extended learning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'school management'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Enrollment and updates' },
    { id: 'admin', name: 'Program Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Students and activities' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'instructor', name: 'Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'enrollment',
    'attendance',
    'parent-portal',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'check-in',
    'gallery',
    'team-management',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build an after school program platform',
    'Create an enrichment activity app',
    'I need an extended care management system',
    'Build an after school enrollment platform',
    'Create a youth program scheduling app',
  ],
};
