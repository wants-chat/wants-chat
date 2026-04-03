/**
 * Country Club App Type Definition
 *
 * Complete definition for country club and private club applications.
 * Essential for country clubs, private clubs, and social clubs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COUNTRY_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'country-club',
  name: 'Country Club',
  category: 'hospitality',
  description: 'Country club platform with membership management, facility booking, dining, and social events',
  icon: 'building-columns',

  keywords: [
    'country club',
    'private club',
    'social club',
    'golf country club',
    'club membership',
    'club management',
    'clubessential',
    'jonas club',
    'northstar club',
    'member billing',
    'club dining',
    'club events',
    'club amenities',
    'swim club',
    'fitness club',
    'tennis club',
    'member directory',
    'club house',
    'private events',
    'club activities',
    'member benefits',
    'initiation fee',
  ],

  synonyms: [
    'country club platform',
    'country club software',
    'private club software',
    'club management system',
    'membership management',
    'social club software',
    'country club app',
    'club billing software',
    'member management',
    'club operations',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'public fitness'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Member access and reservations' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Club operations and membership' },
  ],

  roles: [
    { id: 'admin', name: 'Club President', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'General Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'dept-head', name: 'Department Head', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/department' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reservations' },
    { id: 'member', name: 'Member', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
    { id: 'spouse', name: 'Spouse', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'ecommerce-cart', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a country club management platform',
    'Create a private club membership app',
    'I need a club management and billing system',
    'Build a country club like ClubEssential',
    'Create a social club member portal',
  ],
};
