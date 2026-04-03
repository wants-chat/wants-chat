/**
 * Cruise Line App Type Definition
 *
 * Complete definition for cruise line and cruise booking applications.
 * Essential for cruise operators, cruise agents, and maritime tourism.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRUISE_LINE_APP_TYPE: AppTypeDefinition = {
  id: 'cruise-line',
  name: 'Cruise Line',
  category: 'travel',
  description: 'Cruise line platform with cabin booking, itinerary management, onboard services, and guest experience',
  icon: 'ship',

  keywords: [
    'cruise line',
    'cruise booking',
    'cruise software',
    'cruise management',
    'cruise ship',
    'cruise reservations',
    'cruise itinerary',
    'cruise operator',
    'cruise cabin',
    'cruise packages',
    'cruise excursions',
    'cruise passengers',
    'cruise scheduling',
    'cruise business',
    'maritime tourism',
    'river cruise',
    'ocean cruise',
    'cruise vacation',
    'cruise agency',
    'cruise portal',
  ],

  synonyms: [
    'cruise line platform',
    'cruise line software',
    'cruise booking software',
    'cruise management software',
    'cruise reservation software',
    'cruise operator software',
    'cruise ship software',
    'cruise passenger software',
    'maritime tourism software',
    'cruise experience software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'cruise control car'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cruises and booking' },
    { id: 'admin', name: 'Cruise Dashboard', enabled: true, basePath: '/admin', requiredRole: 'crew', layout: 'admin', description: 'Voyages and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Cruise Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/voyages' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/guests' },
    { id: 'agent', name: 'Booking Agent', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a cruise booking platform',
    'Create a cruise line management app',
    'I need a cruise reservation system',
    'Build a cruise ship booking app',
    'Create a maritime tourism platform',
  ],
};
