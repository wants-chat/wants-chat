/**
 * Vocational School App Type Definition
 *
 * Complete definition for vocational and trade school operations.
 * Essential for vocational schools, technical colleges, and career training centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOCATIONAL_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'vocational-school',
  name: 'Vocational School',
  category: 'education',
  description: 'Vocational school platform with program enrollment, certification tracking, job placement, and hands-on training',
  icon: 'wrench',

  keywords: [
    'vocational school',
    'trade school',
    'vocational school software',
    'technical college',
    'career training',
    'vocational school management',
    'program enrollment',
    'vocational school practice',
    'vocational school scheduling',
    'certification tracking',
    'vocational school crm',
    'job placement',
    'vocational school business',
    'hands-on training',
    'vocational school pos',
    'skilled trades',
    'vocational school operations',
    'apprenticeship',
    'vocational school platform',
    'industry certification',
  ],

  synonyms: [
    'vocational school platform',
    'vocational school software',
    'trade school software',
    'technical college software',
    'career training software',
    'program enrollment software',
    'vocational school practice software',
    'certification tracking software',
    'job placement software',
    'apprenticeship software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and careers' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and programs' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'advisor', name: 'Career Advisor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/placements' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a vocational school platform',
    'Create a trade school portal',
    'I need a career training management system',
    'Build a certification tracking platform',
    'Create a job placement app',
  ],
};
