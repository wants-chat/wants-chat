/**
 * Trade School App Type Definition
 *
 * Complete definition for trade school and vocational training applications.
 * Essential for trade schools, vocational centers, and technical training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'trade-school',
  name: 'Trade School',
  category: 'education',
  description: 'Trade school platform with program enrollment, hands-on training tracking, certifications, and job placement',
  icon: 'wrench',

  keywords: [
    'trade school',
    'vocational school',
    'technical school',
    'vocational training',
    'trade training',
    'apprenticeship',
    'skilled trades',
    'welding school',
    'electrician training',
    'plumbing school',
    'hvac training',
    'automotive school',
    'construction training',
    'carpentry school',
    'machinist training',
    'emt training',
    'cosmetology school',
    'medical assistant',
    'dental assistant',
    'phlebotomy training',
    'cna program',
  ],

  synonyms: [
    'trade school platform',
    'trade school software',
    'vocational school software',
    'technical training software',
    'trade education app',
    'vocational training platform',
    'apprenticeship management',
    'skilled trades software',
    'trade school management',
    'vocational education app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Apply and track progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Programs and certifications' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Program Coordinator', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'instructor', name: 'Trade Instructor', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'placement', name: 'Job Placement', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/careers' },
    { id: 'admissions', name: 'Admissions', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/applications' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'calendar',
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
    'documents',
    'analytics',
    'certificates',
    'transcripts',
    'class-roster',
    'assignments',
  ],

  incompatibleFeatures: ['table-reservations', 'ecommerce-full', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a trade school management platform',
    'Create a vocational training tracking app',
    'I need a technical school with certification tracking',
    'Build an apprenticeship management system',
    'Create a skilled trades education platform',
  ],
};
