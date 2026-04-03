/**
 * Golf Course App Type Definition
 *
 * Complete definition for golf course and golf club applications.
 * Essential for golf courses, country clubs, and golf facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GOLF_COURSE_APP_TYPE: AppTypeDefinition = {
  id: 'golf-course',
  name: 'Golf Course',
  category: 'sports',
  description: 'Golf course platform with tee time booking, handicap tracking, pro shop, and tournament management',
  icon: 'golf-ball-tee',

  keywords: [
    'golf course',
    'golf club',
    'tee times',
    'golf booking',
    'golf reservation',
    'golfnow',
    'teeoff',
    'golf18network',
    'pro shop',
    'driving range',
    'golf lessons',
    'golf cart',
    'golf tournament',
    'handicap',
    'golf membership',
    'country club golf',
    'public golf',
    'private golf',
    'golf outing',
    'golf simulator',
    'putting green',
    'golf packages',
  ],

  synonyms: [
    'golf course platform',
    'golf course software',
    'golf booking system',
    'tee time software',
    'golf club management',
    'golf reservation software',
    'golf course app',
    'golf scheduling',
    'golf tee time app',
    'golf management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Golfer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book tee times and view course' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Course and member management' },
  ],

  roles: [
    { id: 'admin', name: 'Club Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Golf Director', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tee-times' },
    { id: 'pro', name: 'Golf Pro', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/my-tee-times' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a golf course tee time booking platform',
    'Create a golf club management app',
    'I need a golf course reservation system',
    'Build a golf app like GolfNow',
    'Create a golf tournament management platform',
  ],
};
