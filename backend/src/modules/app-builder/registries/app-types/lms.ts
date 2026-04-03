/**
 * Learning Management System (LMS) App Type Definition
 *
 * Complete definition for learning management and online education platforms.
 * High demand for schools, universities, corporate training, and online courses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LMS_APP_TYPE: AppTypeDefinition = {
  id: 'lms',
  name: 'Learning Management System',
  category: 'education',
  description: 'Online learning platform with courses, lessons, quizzes, progress tracking, and certifications',
  icon: 'graduation-cap',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'lms',
    'learning management',
    'learning management system',
    'online learning',
    'e-learning',
    'elearning',
    'online courses',
    'course platform',
    'training platform',
    'educational platform',
    'online education',
    'virtual learning',
    'udemy',
    'coursera',
    'skillshare',
    'teachable',
    'thinkific',
    'kajabi',
    'moodle',
    'canvas',
    'blackboard',
    'course creator',
    'online school',
    'digital learning',
    'corporate training',
    'employee training',
    'certification',
    'quiz',
    'assessment',
  ],

  synonyms: [
    'online course platform',
    'learning platform',
    'training system',
    'education platform',
    'course management',
    'knowledge platform',
    'skill training',
    'online academy',
    'virtual classroom',
    'digital classroom',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'landing page',
    'ecommerce only',
    'shopping',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Student Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public course catalog and student learning interface',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Platform administration and analytics',
    },
    {
      id: 'vendor',
      name: 'Instructor Portal',
      enabled: true,
      basePath: '/instructor',
      requiredRole: 'instructor',
      layout: 'admin',
      description: 'Course creation and student management for instructors',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Platform Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'instructor',
      name: 'Instructor',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/instructor/courses',
    },
    {
      id: 'student',
      name: 'Student',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/my-learning',
    },
    {
      id: 'guest',
      name: 'Guest',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/courses',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'analytics',
    'search',
    'notifications',
    'lms',
    'course-management',
    'assignments',
    'grading',
    'student-records',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reviews',
    'certificates',
    'transcripts',
    'enrollment',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'inventory',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an online learning platform like Udemy',
    'Create an LMS for my company training',
    'I need an e-learning platform with courses and quizzes',
    'Build a course platform where instructors can sell courses',
    'Create an online school for coding bootcamp',
    'I want to build a corporate training platform',
    'Make a learning management system with certifications',
  ],
};
