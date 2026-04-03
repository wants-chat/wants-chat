/**
 * Vacation Rental App Type Definition
 *
 * Complete definition for vacation rental and short-term rental applications.
 * Essential for vacation rental owners, property managers, and rental agencies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-rental',
  name: 'Vacation Rental',
  category: 'travel',
  description: 'Vacation rental platform with property listings, booking management, guest communication, and channel management',
  icon: 'home',

  keywords: [
    'vacation rental',
    'short term rental',
    'vacation rental software',
    'rental booking',
    'airbnb management',
    'vrbo management',
    'vacation home',
    'rental property',
    'guest booking',
    'vacation rental management',
    'holiday rental',
    'rental calendar',
    'rental reservations',
    'beach house rental',
    'cabin rental',
    'cottage rental',
    'vacation rental business',
    'rental owner',
    'rental listing',
    'property rental',
  ],

  synonyms: [
    'vacation rental platform',
    'vacation rental software',
    'short term rental software',
    'rental booking software',
    'vacation rental management software',
    'holiday rental software',
    'rental reservation software',
    'vacation property software',
    'rental owner software',
    'rental channel software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'long term rental'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Properties and booking' },
    { id: 'admin', name: 'Owner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Rentals and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Property Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'cleaner', name: 'Cleaning Staff', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'invoicing',
    'notifications',
    'search',
    'messaging',
    'documents',
    'property-listings',
    'virtual-tours',
    'lease-management',
    'maintenance-requests',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'analytics',
    'mls-integration',
    'open-houses',
    'rent-collection',
    'tenant-screening',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a vacation rental platform',
    'Create a short-term rental management app',
    'I need an Airbnb-style booking system',
    'Build a vacation home rental app',
    'Create a rental property booking platform',
  ],
};
