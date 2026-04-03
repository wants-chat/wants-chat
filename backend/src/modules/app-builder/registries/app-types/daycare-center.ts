/**
 * Daycare Center App Type Definition
 *
 * Complete definition for childcare center operations.
 * Essential for daycare centers, preschools, and early childhood programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DAYCARE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'daycare-center',
  name: 'Daycare Center',
  category: 'education',
  description: 'Daycare center platform with enrollment management, daily reports, parent communication, and billing automation',
  icon: 'baby',

  keywords: [
    'daycare center',
    'childcare',
    'daycare center software',
    'preschool',
    'early childhood',
    'daycare center management',
    'enrollment management',
    'daycare center practice',
    'daycare center scheduling',
    'daily reports',
    'daycare center crm',
    'parent communication',
    'daycare center business',
    'billing automation',
    'daycare center pos',
    'infant care',
    'daycare center operations',
    'toddler program',
    'daycare center platform',
    'after school',
  ],

  synonyms: [
    'daycare center platform',
    'daycare center software',
    'childcare software',
    'preschool software',
    'early childhood software',
    'enrollment management software',
    'daycare center practice software',
    'daily reports software',
    'parent communication software',
    'infant care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and payments' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Children and classrooms' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'teacher', name: 'Lead Teacher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classroom' },
    { id: 'assistant', name: 'Teaching Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attendance' },
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
    'scheduling',
    'reporting',
    'analytics',
    'certificates',
    'transcripts',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a daycare center platform',
    'Create a childcare management app',
    'I need a preschool enrollment system',
    'Build a daycare parent portal',
    'Create an early childhood center app',
  ],
};
