/**
 * Daycare & Childcare App Type Definition
 *
 * Complete definition for daycare and childcare management applications.
 * Essential for daycares, preschools, and childcare providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DAYCARE_APP_TYPE: AppTypeDefinition = {
  id: 'daycare',
  name: 'Daycare & Childcare',
  category: 'education',
  description: 'Childcare management platform with enrollment, attendance, parent communication, and billing',
  icon: 'baby',

  keywords: [
    'daycare',
    'childcare',
    'preschool',
    'nursery',
    'child care center',
    'early childhood',
    'brightwheel',
    'himama',
    'procare',
    'childcare management',
    'infant care',
    'toddler program',
    'after school',
    'summer camp',
    'babysitter',
    'nanny',
    'child development',
    'early learning',
    'kid care',
    'child enrollment',
    'parent communication',
    'child attendance',
  ],

  synonyms: [
    'daycare software',
    'childcare platform',
    'preschool management',
    'nursery software',
    'childcare app',
    'daycare management',
    'early childhood software',
    'childcare center software',
    'child care app',
    'daycare platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Parent access and communication' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'director', layout: 'admin', description: 'Center management and administration' },
  ],

  roles: [
    { id: 'admin', name: 'Owner/Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Center Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/overview' },
    { id: 'teacher', name: 'Teacher/Caregiver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classroom' },
    { id: 'parent', name: 'Parent/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'notifications',
    'calendar',
    'student-records',
    'enrollment',
    'attendance',
    'parent-portal',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'gallery',
    'scheduling',
    'certificates',
    'transcripts',
  ],

  incompatibleFeatures: ['shopping-cart', 'inventory', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a daycare management system',
    'Create a childcare app like Brightwheel',
    'I need a preschool parent communication platform',
    'Build a nursery management software',
    'Create a daycare app with attendance and billing',
  ],
};
