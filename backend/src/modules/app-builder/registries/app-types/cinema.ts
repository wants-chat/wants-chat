/**
 * Cinema App Type Definition
 *
 * Complete definition for movie theater and cinema applications.
 * Essential for cinemas, movie theaters, and film screening venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CINEMA_APP_TYPE: AppTypeDefinition = {
  id: 'cinema',
  name: 'Cinema',
  category: 'entertainment',
  description: 'Cinema platform with movie ticketing, seat selection, concession ordering, and loyalty programs',
  icon: 'film',

  keywords: [
    'cinema',
    'movie theater',
    'cinema software',
    'movie ticketing',
    'seat selection',
    'film screening',
    'cinema booking',
    'movie showtimes',
    'cinema pos',
    'cinema concessions',
    'multiplex',
    'cinema crm',
    'movie tickets',
    'cinema scheduling',
    'movie theater management',
    'cinema loyalty',
    'film theater',
    'cinema business',
    'imax',
    'cinema chain',
  ],

  synonyms: [
    'cinema platform',
    'cinema software',
    'movie theater software',
    'cinema ticketing software',
    'movie booking software',
    'cinema management software',
    'film theater software',
    'cinema pos software',
    'multiplex software',
    'movie theater management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home theater'],

  sections: [
    { id: 'frontend', name: 'Moviegoer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and showtimes' },
    { id: 'admin', name: 'Cinema Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Shows and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Cinema Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/showtimes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/screenings' },
    { id: 'moviegoer', name: 'Moviegoer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'seating-charts',
    'box-office',
    'show-scheduling',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'announcements',
    'reporting',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a cinema ticketing platform',
    'Create a movie theater booking app',
    'I need a cinema management system',
    'Build a multiplex scheduling platform',
    'Create a movie showtime app',
  ],
};
