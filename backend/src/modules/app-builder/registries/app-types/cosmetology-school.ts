/**
 * Cosmetology School App Type Definition
 *
 * Complete definition for cosmetology school operations.
 * Essential for beauty schools and esthetician training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COSMETOLOGY_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'cosmetology-school',
  name: 'Cosmetology School',
  category: 'education',
  description: 'Cosmetology school platform with course scheduling, practical training, licensing prep, and student salon management',
  icon: 'sparkles',

  keywords: [
    'cosmetology school',
    'beauty school',
    'cosmetology school software',
    'esthetician training',
    'hair styling school',
    'cosmetology school management',
    'course scheduling',
    'cosmetology school practice',
    'cosmetology school scheduling',
    'practical training',
    'cosmetology school crm',
    'licensing prep',
    'cosmetology school business',
    'student salon',
    'cosmetology school pos',
    'nail technician',
    'cosmetology school operations',
    'makeup artistry',
    'cosmetology school platform',
    'spa training',
  ],

  synonyms: [
    'cosmetology school platform',
    'cosmetology school software',
    'beauty school software',
    'esthetician training software',
    'hair styling school software',
    'course scheduling software',
    'cosmetology school practice software',
    'practical training software',
    'licensing prep software',
    'spa training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and licensing' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and student salon' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Licensed Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/enrollment' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a cosmetology school platform',
    'Create a beauty school portal',
    'I need an esthetician training management system',
    'Build a licensing prep platform',
    'Create a student salon and training app',
  ],
};
