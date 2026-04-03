/**
 * Surf School App Type Definition
 *
 * Complete definition for surf instruction and water sports training.
 * Essential for surf schools, paddle board instruction, and beach sports academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURF_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'surf-school',
  name: 'Surf School',
  category: 'education',
  description: 'Surf school platform with lesson booking, instructor scheduling, board rentals, and weather condition tracking',
  icon: 'waves',

  keywords: [
    'surf school',
    'surfing lessons',
    'surf school software',
    'paddle board',
    'beach sports',
    'surf school management',
    'lesson booking',
    'surf school practice',
    'surf school scheduling',
    'instructor scheduling',
    'surf school crm',
    'board rentals',
    'surf school business',
    'weather conditions',
    'surf school pos',
    'beginner surf',
    'surf school operations',
    'surf camp',
    'surf school platform',
    'ocean sports',
  ],

  synonyms: [
    'surf school platform',
    'surf school software',
    'surfing lessons software',
    'paddle board software',
    'beach sports software',
    'lesson booking software',
    'surf school practice software',
    'instructor scheduling software',
    'board rentals software',
    'beginner surf software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and rentals' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Instructors and conditions' },
  ],

  roles: [
    { id: 'admin', name: 'School Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Surf Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Beach Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'beach',

  examplePrompts: [
    'Build a surf school platform',
    'Create a surfing lessons portal',
    'I need a beach sports system',
    'Build a surf lesson booking platform',
    'Create a paddle board rental app',
  ],
};
