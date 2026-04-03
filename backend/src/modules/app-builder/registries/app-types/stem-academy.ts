/**
 * STEM Academy App Type Definition
 *
 * Complete definition for STEM education center operations.
 * Essential for STEM academies, robotics schools, and coding camps.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STEM_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'stem-academy',
  name: 'STEM Academy',
  category: 'education',
  description: 'STEM academy platform with program enrollment, project tracking, competition management, and equipment scheduling',
  icon: 'cpu',

  keywords: [
    'stem academy',
    'robotics school',
    'stem academy software',
    'coding camp',
    'science education',
    'stem academy management',
    'program enrollment',
    'stem academy practice',
    'stem academy scheduling',
    'project tracking',
    'stem academy crm',
    'competition management',
    'stem academy business',
    'equipment scheduling',
    'stem academy pos',
    'engineering',
    'stem academy operations',
    'technology',
    'stem academy platform',
    'mathematics',
  ],

  synonyms: [
    'stem academy platform',
    'stem academy software',
    'robotics school software',
    'coding camp software',
    'science education software',
    'program enrollment software',
    'stem academy practice software',
    'project tracking software',
    'competition management software',
    'engineering software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and projects' },
    { id: 'admin', name: 'Academy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Academy Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'mentor', name: 'Mentor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
    'course-management',
    'student-records',
    'enrollment',
    'attendance',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
    'class-roster',
    'assignments',
    'parent-portal',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a STEM academy platform',
    'Create a robotics school portal',
    'I need a coding camp management system',
    'Build a project tracking platform',
    'Create a competition management app',
  ],
};
