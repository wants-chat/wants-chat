/**
 * IT Bootcamp App Type Definition
 *
 * Complete definition for intensive technology training operations.
 * Essential for coding bootcamps, tech academies, and software development schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IT_BOOTCAMP_APP_TYPE: AppTypeDefinition = {
  id: 'it-bootcamp',
  name: 'IT Bootcamp',
  category: 'education',
  description: 'IT bootcamp platform with cohort management, project submissions, career services, and skills assessment tracking',
  icon: 'code',

  keywords: [
    'it bootcamp',
    'coding bootcamp',
    'it bootcamp software',
    'tech academy',
    'software training',
    'it bootcamp management',
    'cohort management',
    'it bootcamp practice',
    'it bootcamp scheduling',
    'project submissions',
    'it bootcamp crm',
    'career services',
    'it bootcamp business',
    'skills assessment',
    'it bootcamp pos',
    'web development',
    'it bootcamp operations',
    'data science',
    'it bootcamp platform',
    'full stack',
  ],

  synonyms: [
    'it bootcamp platform',
    'it bootcamp software',
    'coding bootcamp software',
    'tech academy software',
    'software training software',
    'cohort management software',
    'it bootcamp practice software',
    'project submissions software',
    'career services software',
    'web development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Curriculum and projects' },
    { id: 'admin', name: 'Bootcamp Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Cohorts and outcomes' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Lead Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cohorts' },
    { id: 'mentor', name: 'Teaching Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'course-management',
    'assignments',
    'grading',
    'student-records',
    'enrollment',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
    'lms',
    'attendance',
    'class-roster',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an IT bootcamp platform',
    'Create a coding academy portal',
    'I need a tech training system',
    'Build a cohort management platform',
    'Create a career services app',
  ],
};
