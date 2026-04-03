/**
 * Kids Coding School App Type Definition
 *
 * Complete definition for kids coding school operations.
 * Essential for coding bootcamps for kids, STEM education centers, and programming academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_CODING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'kids-coding-school',
  name: 'Kids Coding School',
  category: 'education',
  description: 'Kids coding platform with curriculum management, project tracking, class scheduling, and parent progress reports',
  icon: 'code',

  keywords: [
    'kids coding school',
    'coding for kids',
    'kids coding school software',
    'stem education',
    'programming academy',
    'kids coding school management',
    'curriculum management',
    'kids coding school practice',
    'kids coding school scheduling',
    'project tracking',
    'kids coding school crm',
    'class scheduling',
    'kids coding school business',
    'parent progress reports',
    'kids coding school pos',
    'scratch programming',
    'kids coding school operations',
    'robotics coding',
    'kids coding school platform',
    'game development kids',
  ],

  synonyms: [
    'kids coding school platform',
    'kids coding school software',
    'coding for kids software',
    'stem education software',
    'programming academy software',
    'curriculum management software',
    'kids coding school practice software',
    'project tracking software',
    'class scheduling software',
    'scratch programming software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and projects' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and classes' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Coding Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Teaching Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'parent', name: 'Parent/Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'course-management',
    'student-records',
    'enrollment',
    'attendance',
    'parent-portal',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
    'class-roster',
    'grading',
    'assignments',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build a kids coding school platform',
    'Create a coding for kids app',
    'I need a STEM education system',
    'Build a programming academy for children app',
    'Create a kids coding school portal',
  ],
};
