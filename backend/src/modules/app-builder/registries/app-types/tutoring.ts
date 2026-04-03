/**
 * Tutoring & Coaching App Type Definition
 *
 * Complete definition for tutoring and coaching applications.
 * Essential for tutors, coaches, mentors, and educational services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'tutoring',
  name: 'Tutoring & Coaching',
  category: 'education',
  description: 'Tutoring platform with session booking, video lessons, progress tracking, and payments',
  icon: 'chalkboard-user',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'tutoring',
    'tutor',
    'tutors',
    'coaching',
    'coach',
    'mentoring',
    'mentor',
    'private lessons',
    'one on one',
    '1-on-1',
    'online tutoring',
    'online coaching',
    'wyzant',
    'preply',
    'italki',
    'chegg tutors',
    'varsity tutors',
    'tutor marketplace',
    'life coach',
    'business coach',
    'fitness coach',
    'language tutor',
    'math tutor',
    'music lessons',
    'private teaching',
    'personal training',
    'consultation',
  ],

  synonyms: [
    'tutoring platform',
    'coaching platform',
    'mentor platform',
    'lesson platform',
    'tutor marketplace',
    'coaching app',
    'tutoring app',
    'mentor app',
    'teaching platform',
    'learning sessions',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public tutor/coach discovery and booking',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Platform administration',
    },
    {
      id: 'vendor',
      name: 'Tutor Dashboard',
      enabled: true,
      basePath: '/tutor',
      requiredRole: 'tutor',
      layout: 'admin',
      description: 'Tutor/coach session and client management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'tutor',
      name: 'Tutor/Coach',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/tutor/dashboard',
    },
    {
      id: 'student',
      name: 'Student/Client',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/find-tutor',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'messaging',
    'notifications',
    'search',
    'student-records',
    'assignments',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'analytics',
    'reviews',
    'announcements',
    'certificates',
    'transcripts',
    'attendance',
    'course-management',
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
    'Build a tutoring platform',
    'Create an online coaching app',
    'I need a tutor marketplace like Wyzant',
    'Build a platform for private lessons',
    'Create a coaching booking system',
    'I want to build a mentoring platform',
    'Make a tutoring app with video sessions',
  ],
};
