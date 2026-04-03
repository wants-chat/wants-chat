/**
 * Hostel App Type Definition
 *
 * Complete definition for hostel and backpacker accommodation applications.
 * Essential for hostels, backpacker lodges, and budget accommodations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOSTEL_APP_TYPE: AppTypeDefinition = {
  id: 'hostel',
  name: 'Hostel',
  category: 'travel',
  description: 'Hostel management platform with bed booking, dorm management, guest check-in, and activity coordination',
  icon: 'bed',

  keywords: [
    'hostel',
    'hostel software',
    'hostel booking',
    'hostel management',
    'backpacker hostel',
    'youth hostel',
    'hostel reservations',
    'dorm booking',
    'hostel pms',
    'hostel bed booking',
    'budget accommodation',
    'hostel check-in',
    'hostel business',
    'hostel scheduling',
    'bunk booking',
    'shared accommodation',
    'hostel front desk',
    'hostel guests',
    'hostel calendar',
    'hostel operations',
  ],

  synonyms: [
    'hostel platform',
    'hostel software',
    'hostel booking software',
    'hostel management software',
    'hostel pms software',
    'backpacker software',
    'hostel reservation software',
    'dorm management software',
    'hostel front desk software',
    'hostel operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'hostel review'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rooms and booking' },
    { id: 'admin', name: 'Hostel Dashboard', enabled: true, basePath: '/admin', requiredRole: 'reception', layout: 'admin', description: 'Guests and beds' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Hostel Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'reception', name: 'Receptionist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'staff', name: 'Staff', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'room-booking',
    'housekeeping',
    'guest-services',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'channel-manager',
    'rate-management',
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'travel',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a hostel booking platform',
    'Create a hostel management app',
    'I need a backpacker hostel system',
    'Build a dorm booking platform',
    'Create a youth hostel management app',
  ],
};
