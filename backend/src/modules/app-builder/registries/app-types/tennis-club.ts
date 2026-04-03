/**
 * Tennis Club App Type Definition
 *
 * Complete definition for tennis club and racquet sports applications.
 * Essential for tennis clubs, racquet clubs, and sports facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENNIS_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'tennis-club',
  name: 'Tennis Club',
  category: 'sports',
  description: 'Tennis club platform with court booking, lessons, leagues, and member management',
  icon: 'table-tennis-paddle-ball',

  keywords: [
    'tennis club',
    'tennis court',
    'tennis booking',
    'racquet club',
    'tennis lessons',
    'tennis pro',
    'tennis league',
    'usta',
    'tennis tournament',
    'pickleball',
    'padel',
    'squash',
    'racquetball',
    'court reservation',
    'tennis membership',
    'tennis camp',
    'junior tennis',
    'adult tennis',
    'doubles tennis',
    'tennis clinics',
    'ball machine',
    'tennis facility',
  ],

  synonyms: [
    'tennis club platform',
    'tennis club software',
    'court booking system',
    'tennis management',
    'racquet club software',
    'tennis reservation software',
    'tennis court app',
    'tennis scheduling',
    'court reservation app',
    'tennis booking app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book courts and join programs' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Court and program management' },
  ],

  roles: [
    { id: 'admin', name: 'Club Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Tennis Director', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courts' },
    { id: 'pro', name: 'Tennis Pro', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/courts' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'equipment-booking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'group-training',
    'fitness-challenges',
    'workout-tracking',
    'body-measurements',
    'waitlist',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a tennis club court booking platform',
    'Create a racquet club management app',
    'I need a tennis court reservation system',
    'Build a tennis club with lessons and leagues',
    'Create a tennis facility booking app',
  ],
};
