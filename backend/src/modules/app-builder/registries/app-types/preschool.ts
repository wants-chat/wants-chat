/**
 * Preschool App Type Definition
 *
 * Complete definition for preschools and early childhood education.
 * Essential for preschools, nursery schools, and pre-K programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRESCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'preschool',
  name: 'Preschool',
  category: 'children',
  description: 'Preschool platform with enrollment management, daily reports, parent communication, and curriculum tracking',
  icon: 'book',

  keywords: [
    'preschool',
    'nursery school',
    'preschool software',
    'early childhood',
    'preschool enrollment',
    'preschool management',
    'pre-k',
    'preschool scheduling',
    'preschool curriculum',
    'toddler program',
    'preschool crm',
    'montessori',
    'preschool business',
    'kindergarten prep',
    'preschool pos',
    'early education',
    'preschool operations',
    'preschool activities',
    'preschool services',
    'child development',
  ],

  synonyms: [
    'preschool platform',
    'preschool software',
    'nursery school software',
    'early childhood software',
    'preschool management software',
    'pre-k software',
    'preschool enrollment software',
    'preschool scheduling software',
    'early education software',
    'child development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'elementary school'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and enrollment' },
    { id: 'admin', name: 'Preschool Dashboard', enabled: true, basePath: '/admin', requiredRole: 'teacher', layout: 'admin', description: 'Students and curriculum' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Assistant Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classrooms' },
    { id: 'teacher', name: 'Teacher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
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
    'gallery',
    'check-in',
    'waitlist',
    'scheduling',
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a preschool management platform',
    'Create a nursery school parent app',
    'I need a pre-K enrollment system',
    'Build an early childhood education platform',
    'Create a preschool daily report app',
  ],
};
