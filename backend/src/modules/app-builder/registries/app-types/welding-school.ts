/**
 * Welding School App Type Definition
 *
 * Complete definition for welding school operations.
 * Essential for welding training programs and trade schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELDING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'welding-school',
  name: 'Welding School',
  category: 'education',
  description: 'Welding school platform with course scheduling, skills training, certification tracking, and safety compliance',
  icon: 'flame',

  keywords: [
    'welding school',
    'trade school',
    'welding school software',
    'welder training',
    'metal fabrication',
    'welding school management',
    'course scheduling',
    'welding school practice',
    'welding school scheduling',
    'skills training',
    'welding school crm',
    'certification tracking',
    'welding school business',
    'safety compliance',
    'welding school pos',
    'mig tig welding',
    'welding school operations',
    'apprenticeship program',
    'welding school platform',
    'industrial welding',
  ],

  synonyms: [
    'welding school platform',
    'welding school software',
    'trade school software',
    'welder training software',
    'metal fabrication software',
    'course scheduling software',
    'welding school practice software',
    'skills training software',
    'certification tracking software',
    'apprenticeship program software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and enrollment' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and certifications' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Welding Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/enrollment' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a welding school platform',
    'Create a trade school portal',
    'I need a welder training management system',
    'Build a certification tracking platform',
    'Create a skills training and job placement app',
  ],
};
