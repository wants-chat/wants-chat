/**
 * Sailing School App Type Definition
 *
 * Complete definition for sailing schools and maritime training.
 * Essential for sailing lessons, ASA certification, and yacht training.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAILING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'sailing-school',
  name: 'Sailing School',
  category: 'marine',
  description: 'Sailing school platform with course scheduling, certification tracking, boat assignments, and weather monitoring',
  icon: 'wind',

  keywords: [
    'sailing school',
    'sailing lessons',
    'sailing school software',
    'learn to sail',
    'ASA certification',
    'sailing school management',
    'sailing courses',
    'sailing instruction',
    'sailing school scheduling',
    'yacht training',
    'sailing school crm',
    'bareboat certification',
    'sailing school business',
    'sailing academy',
    'sailing school pos',
    'powerboat training',
    'sailing school operations',
    'coastal navigation',
    'sailing school services',
    'sailing education',
  ],

  synonyms: [
    'sailing school platform',
    'sailing school software',
    'sailing lessons software',
    'learn to sail software',
    'ASA certification software',
    'sailing courses software',
    'sailing instruction software',
    'yacht training software',
    'sailing academy software',
    'sailing education software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'driving school'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Students and boats' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courses' },
    { id: 'instructor', name: 'Sailing Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'course-management',
    'attendance',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
    'enrollment',
    'grading',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'nautical',

  examplePrompts: [
    'Build a sailing school platform',
    'Create an ASA sailing course app',
    'I need a sailing lessons scheduling system',
    'Build a yacht training certification platform',
    'Create a maritime education app',
  ],
};
