/**
 * Bartending School App Type Definition
 *
 * Complete definition for bartending school operations.
 * Essential for bartender training programs and mixology academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BARTENDING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'bartending-school',
  name: 'Bartending School',
  category: 'education',
  description: 'Bartending school platform with course scheduling, mixology tutorials, certification tracking, and job placement',
  icon: 'wine',

  keywords: [
    'bartending school',
    'mixology academy',
    'bartending school software',
    'bartender training',
    'cocktail course',
    'bartending school management',
    'course scheduling',
    'bartending school practice',
    'bartending school scheduling',
    'mixology tutorials',
    'bartending school crm',
    'certification tracking',
    'bartending school business',
    'job placement',
    'bartending school pos',
    'bar skills',
    'bartending school operations',
    'beverage education',
    'bartending school platform',
    'flair bartending',
  ],

  synonyms: [
    'bartending school platform',
    'bartending school software',
    'mixology academy software',
    'bartender training software',
    'cocktail course software',
    'course scheduling software',
    'bartending school practice software',
    'mixology tutorials software',
    'certification tracking software',
    'beverage education software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and enrollment' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and students' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Bartender Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a bartending school platform',
    'Create a mixology academy portal',
    'I need a bartender training management system',
    'Build a cocktail course platform',
    'Create a certification and job placement app',
  ],
};
