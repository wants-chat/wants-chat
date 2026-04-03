/**
 * Shooting Range App Type Definition
 *
 * Complete definition for shooting range and firearms training applications.
 * Essential for shooting ranges, gun clubs, and firearms training facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOOTING_RANGE_APP_TYPE: AppTypeDefinition = {
  id: 'shooting-range',
  name: 'Shooting Range',
  category: 'sports',
  description: 'Shooting range platform with lane booking, firearms training, membership management, and safety compliance',
  icon: 'bullseye',

  keywords: [
    'shooting range',
    'gun range',
    'firearms training',
    'indoor range',
    'outdoor range',
    'gun club',
    'rifle range',
    'pistol range',
    'skeet shooting',
    'trap shooting',
    'sporting clays',
    'archery range',
    'concealed carry',
    'ccw class',
    'firearms safety',
    'nra',
    'gun rental',
    'ammo sales',
    'range membership',
    'tactical training',
    'marksmanship',
    'shooting lessons',
  ],

  synonyms: [
    'shooting range platform',
    'shooting range software',
    'gun range software',
    'range booking system',
    'firearms training software',
    'gun club software',
    'range management app',
    'shooting club software',
    'range reservation system',
    'firearms facility app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book lanes and classes' },
    { id: 'admin', name: 'Range Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Range operations and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Range Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Range Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lanes' },
    { id: 'instructor', name: 'Instructor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'rso', name: 'Range Safety Officer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/range' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/my-reservations' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'subscriptions',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a shooting range booking platform',
    'Create a gun range management app',
    'I need a firearms training scheduling system',
    'Build a shooting range with lane reservations',
    'Create a gun club membership platform',
  ],
};
