/**
 * Beauty Academy App Type Definition
 *
 * Complete definition for cosmetology education and beauty training operations.
 * Essential for beauty schools, cosmetology academies, and esthetician programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BEAUTY_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'beauty-academy',
  name: 'Beauty Academy',
  category: 'education',
  description: 'Beauty academy platform with course scheduling, clinic hours tracking, state board prep, and portfolio management',
  icon: 'sparkles',

  keywords: [
    'beauty academy',
    'cosmetology school',
    'beauty academy software',
    'esthetician training',
    'hair school',
    'beauty academy management',
    'course scheduling',
    'beauty academy practice',
    'beauty academy scheduling',
    'clinic hours',
    'beauty academy crm',
    'state board prep',
    'beauty academy business',
    'portfolio management',
    'beauty academy pos',
    'nail technician',
    'beauty academy operations',
    'makeup artist',
    'beauty academy platform',
    'licensing prep',
  ],

  synonyms: [
    'beauty academy platform',
    'beauty academy software',
    'cosmetology school software',
    'esthetician training software',
    'hair school software',
    'course scheduling software',
    'beauty academy practice software',
    'clinic hours software',
    'state board prep software',
    'nail technician software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and clinic' },
    { id: 'admin', name: 'Academy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and hours' },
  ],

  roles: [
    { id: 'admin', name: 'Academy Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clinic' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a beauty academy platform',
    'Create a cosmetology school portal',
    'I need a beauty education system',
    'Build a clinic hours tracking platform',
    'Create a state board prep app',
  ],
};
