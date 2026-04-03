/**
 * Job Board & Recruiting App Type Definition
 *
 * Complete definition for job board and recruiting applications.
 * Essential for job boards, recruiting agencies, and HR departments.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JOB_BOARD_APP_TYPE: AppTypeDefinition = {
  id: 'job-board',
  name: 'Job Board & Recruiting',
  category: 'business',
  description: 'Job posting platform with applications, candidate management, and recruiting workflows',
  icon: 'briefcase',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'job board',
    'job portal',
    'job listing',
    'job posting',
    'careers',
    'careers page',
    'recruiting',
    'recruitment',
    'hiring',
    'applicant tracking',
    'ats',
    'candidate management',
    'talent acquisition',
    'hr software',
    'hr management',
    'linkedin',
    'indeed',
    'glassdoor',
    'monster',
    'ziprecruiter',
    'workable',
    'greenhouse',
    'lever',
    'breezy',
    'job search',
    'employment',
    'staffing',
    'headhunting',
    'resume',
    'cv database',
  ],

  synonyms: [
    'job platform',
    'career platform',
    'hiring platform',
    'recruitment platform',
    'talent platform',
    'employment portal',
    'job marketplace',
    'career portal',
    'hiring software',
    'recruiting software',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
    'fitness',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Job Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public job listings and candidate application portal',
    },
    {
      id: 'admin',
      name: 'Recruiter Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'recruiter',
      layout: 'admin',
      description: 'Job management and candidate tracking for recruiters',
    },
    {
      id: 'vendor',
      name: 'Employer Portal',
      enabled: true,
      basePath: '/employer',
      requiredRole: 'employer',
      layout: 'admin',
      description: 'Job posting and management for employers',
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
      id: 'recruiter',
      name: 'Recruiter',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/candidates',
    },
    {
      id: 'employer',
      name: 'Employer',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/employer/jobs',
    },
    {
      id: 'candidate',
      name: 'Job Seeker',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/jobs',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hr',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a job board platform',
    'Create a recruiting system',
    'I need an applicant tracking system',
    'Build a careers page for my company',
    'Create a job portal like Indeed',
    'I want to build a hiring platform',
    'Make a recruitment app with candidate management',
  ],
};
