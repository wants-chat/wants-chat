/**
 * Scuba Diving App Type Definition
 *
 * Complete definition for scuba diving and dive shop applications.
 * Essential for dive shops, dive centers, and scuba certification programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCUBA_DIVING_APP_TYPE: AppTypeDefinition = {
  id: 'scuba-diving',
  name: 'Scuba Diving',
  category: 'tourism',
  description: 'Scuba diving platform with dive trip booking, certification courses, equipment rentals, and dive logs',
  icon: 'water',

  keywords: [
    'scuba diving',
    'dive shop',
    'dive center',
    'padi',
    'ssi',
    'naui',
    'scuba certification',
    'open water',
    'advanced diver',
    'dive master',
    'dive trips',
    'dive boat',
    'snorkeling',
    'freediving',
    'underwater',
    'dive equipment',
    'dive gear rental',
    'dive courses',
    'dive vacation',
    'liveaboard',
    'reef diving',
    'wreck diving',
  ],

  synonyms: [
    'scuba diving platform',
    'dive shop software',
    'dive center software',
    'scuba booking system',
    'dive shop management',
    'scuba certification software',
    'dive trip booking',
    'diving app',
    'dive school software',
    'scuba shop app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Diver Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book dives and courses' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dive operations and students' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Dive Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/trips' },
    { id: 'instructor', name: 'Dive Instructor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/courses' },
    { id: 'divemaster', name: 'Divemaster', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dives' },
    { id: 'diver', name: 'Diver', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['course-management-lms', 'workout-plans', 'ecommerce-full'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'tourism',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a scuba diving booking platform',
    'Create a dive shop management app',
    'I need a PADI certification course system',
    'Build a dive center with equipment rentals',
    'Create a scuba diving trip booking app',
  ],
};
