/**
 * Mini Golf App Type Definition
 *
 * Complete definition for mini golf and putt-putt applications.
 * Essential for mini golf courses, putt-putt facilities, and golf entertainment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MINI_GOLF_APP_TYPE: AppTypeDefinition = {
  id: 'mini-golf',
  name: 'Mini Golf',
  category: 'entertainment',
  description: 'Mini golf platform with tee time booking, scoring, party packages, and course management',
  icon: 'golf-ball-tee',

  keywords: [
    'mini golf',
    'miniature golf',
    'putt putt',
    'putting course',
    'glow golf',
    'indoor golf',
    'golf entertainment',
    'topgolf',
    'puttshack',
    'golfing',
    'golf party',
    'golf birthday',
    'family golf',
    'adventure golf',
    'themed golf',
    'golf course',
    'golf scoring',
    'golf tee time',
    'golf reservation',
    'golf entertainment center',
    'golf bar',
    'par 3',
  ],

  synonyms: [
    'mini golf platform',
    'mini golf software',
    'putt putt booking',
    'miniature golf software',
    'golf entertainment app',
    'mini golf management',
    'putt putt management',
    'mini golf booking',
    'golf course software',
    'adventure golf software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book tee times and parties' },
    { id: 'admin', name: 'Course Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Course and booking management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'entertainment',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build a mini golf booking platform',
    'Create a putt putt course management app',
    'I need a mini golf tee time system',
    'Build a golf entertainment center app',
    'Create a miniature golf booking system',
  ],
};
