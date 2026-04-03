/**
 * Campground & RV Park App Type Definition
 *
 * Complete definition for campground and RV park applications.
 * Essential for campgrounds, RV parks, glamping sites, and outdoor resorts.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAMPGROUND_APP_TYPE: AppTypeDefinition = {
  id: 'campground',
  name: 'Campground & RV Park',
  category: 'hospitality',
  description: 'Campground platform with site reservations, amenity booking, guest management, and seasonal rates',
  icon: 'campground',

  keywords: [
    'campground',
    'rv park',
    'camping',
    'glamping',
    'tent camping',
    'rv resort',
    'koa',
    'campspot',
    'recreation.gov',
    'hipcamp',
    'campsite',
    'rv site',
    'cabin rental',
    'yurt',
    'treehouse',
    'outdoor resort',
    'state park',
    'national park camping',
    'campground reservation',
    'rv hookups',
    'tent site',
    'camping resort',
  ],

  synonyms: [
    'campground platform',
    'campground software',
    'rv park software',
    'camping reservation system',
    'campground management',
    'rv park management',
    'campsite booking',
    'camping app',
    'campground booking',
    'outdoor hospitality software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book sites and view amenities' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Reservations and park management' },
  ],

  roles: [
    { id: 'admin', name: 'Park Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Park Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'hospitality',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'nature',

  examplePrompts: [
    'Build a campground reservation platform',
    'Create an RV park management app',
    'I need a camping booking system',
    'Build a glamping site like Hipcamp',
    'Create a campground management software',
  ],
};
