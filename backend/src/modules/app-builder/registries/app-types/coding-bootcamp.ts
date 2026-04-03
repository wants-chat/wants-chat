/**
 * Coding Bootcamp App Type Definition
 *
 * Complete definition for coding bootcamp and tech education applications.
 * Essential for coding bootcamps, tech academies, and software training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CODING_BOOTCAMP_APP_TYPE: AppTypeDefinition = {
  id: 'coding-bootcamp',
  name: 'Coding Bootcamp',
  category: 'education',
  description: 'Coding bootcamp platform with curriculum management, project tracking, career services, and cohort management',
  icon: 'code',

  keywords: [
    'coding bootcamp',
    'programming bootcamp',
    'web development course',
    'software engineering bootcamp',
    'learn to code',
    'coding school',
    'tech bootcamp',
    'full stack bootcamp',
    'data science bootcamp',
    'coding academy',
    'developer training',
    'javascript course',
    'python bootcamp',
    'coding intensive',
    'career change coding',
    'software development course',
    'programming school',
    'code camp',
    'ux bootcamp',
    'cybersecurity bootcamp',
    'devops training',
  ],

  synonyms: [
    'coding bootcamp platform',
    'coding bootcamp software',
    'programming school software',
    'tech education platform',
    'developer training app',
    'coding school software',
    'bootcamp management system',
    'tech academy software',
    'coding course platform',
    'software training app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Apply and access curriculum' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Cohorts and curriculum' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Lead Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cohorts' },
    { id: 'ta', name: 'Teaching Assistant', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'career', name: 'Career Coach', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/careers' },
    { id: 'admissions', name: 'Admissions', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/applications' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
    { id: 'alumni', name: 'Alumni', level: 15, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/alumni' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'calendar',
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
    'certificates',
    'transcripts',
    'lms',
    'attendance',
    'class-roster',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a coding bootcamp platform',
    'Create a programming school management app',
    'I need a tech bootcamp with curriculum tracking',
    'Build a software engineering bootcamp platform',
    'Create a coding academy with career services',
  ],
};
