/**
 * Community Center App Type Definition
 *
 * Complete definition for community center and recreation center applications.
 * Essential for community centers, rec centers, and public facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMUNITY_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'community-center',
  name: 'Community Center',
  category: 'community',
  description: 'Community center platform with program registration, facility booking, membership management, and event scheduling',
  icon: 'building-2',

  keywords: [
    'community center',
    'recreation center',
    'rec center',
    'ymca',
    'community facility',
    'public recreation',
    'community programs',
    'youth programs',
    'senior programs',
    'community classes',
    'facility rental',
    'room booking',
    'community events',
    'neighborhood center',
    'civic center',
    'recreation programs',
    'community membership',
    'after school',
    'summer programs',
    'community sports',
    'community fitness',
  ],

  synonyms: [
    'community center platform',
    'community center software',
    'recreation center software',
    'rec center app',
    'community facility software',
    'program registration software',
    'community center management',
    'recreation management',
    'civic center software',
    'community programs app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'church'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Register and book facilities' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Programs and facilities' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Program Coordinator', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'instructor', name: 'Instructor', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Front Desk', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'check-in',
    'email',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'community',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a community center platform',
    'Create a recreation center management app',
    'I need a community program registration system',
    'Build a rec center with facility booking',
    'Create a YMCA-style community app',
  ],
};
