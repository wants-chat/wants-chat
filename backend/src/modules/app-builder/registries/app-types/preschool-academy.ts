/**
 * Preschool Academy App Type Definition
 *
 * Complete definition for preschool and early childhood education operations.
 * Essential for preschools, Montessori schools, and early learning centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRESCHOOL_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'preschool-academy',
  name: 'Preschool Academy',
  category: 'education',
  description: 'Preschool platform with enrollment management, daily reports, parent communication, and curriculum planning',
  icon: 'baby',

  keywords: [
    'preschool academy',
    'early childhood',
    'preschool academy software',
    'montessori',
    'early learning',
    'preschool academy management',
    'enrollment management',
    'preschool academy practice',
    'preschool academy scheduling',
    'daily reports',
    'preschool academy crm',
    'parent communication',
    'preschool academy business',
    'curriculum planning',
    'preschool academy pos',
    'child development',
    'preschool academy operations',
    'lesson plans',
    'preschool academy platform',
    'potty training',
  ],

  synonyms: [
    'preschool academy platform',
    'preschool academy software',
    'early childhood software',
    'montessori software',
    'early learning software',
    'enrollment management software',
    'preschool academy practice software',
    'daily reports software',
    'parent communication software',
    'child development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and communication' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classrooms and children' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'teacher', name: 'Lead Teacher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classroom' },
    { id: 'assistant', name: 'Teacher Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attendance' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'student-records',
    'enrollment',
    'attendance',
    'parent-portal',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a preschool academy platform',
    'Create an early learning portal',
    'I need a preschool management system',
    'Build a parent communication platform',
    'Create a child development tracking app',
  ],
};
