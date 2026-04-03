/**
 * Drive-In Theater App Type Definition
 *
 * Complete definition for drive-in theaters and outdoor cinema applications.
 * Essential for drive-in theaters, outdoor movie venues, and pop-up cinemas.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRIVE_IN_THEATER_APP_TYPE: AppTypeDefinition = {
  id: 'drive-in-theater',
  name: 'Drive-In Theater',
  category: 'entertainment',
  description: 'Drive-in theater platform with spot reservations, car-hop ordering, double features, and seasonal scheduling',
  icon: 'car',

  keywords: [
    'drive-in theater',
    'outdoor cinema',
    'drive-in software',
    'drive-in movies',
    'drive-in ticketing',
    'car cinema',
    'drive-in booking',
    'outdoor movies',
    'drive-in pos',
    'drive-in scheduling',
    'double feature',
    'drive-in crm',
    'drive-in concessions',
    'drive-in business',
    'pop-up cinema',
    'starlight cinema',
    'drive-in management',
    'car-hop service',
    'drive-in venue',
    'outdoor theater',
  ],

  synonyms: [
    'drive-in theater platform',
    'drive-in theater software',
    'outdoor cinema software',
    'drive-in ticketing software',
    'car cinema software',
    'drive-in booking software',
    'outdoor movie software',
    'drive-in pos software',
    'drive-in management software',
    'pop-up cinema software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'indoor theater'],

  sections: [
    { id: 'frontend', name: 'Moviegoer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and spots' },
    { id: 'admin', name: 'Drive-In Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Shows and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Theater Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/showtimes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/screenings' },
    { id: 'moviegoer', name: 'Moviegoer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'box-office',
    'show-scheduling',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'reminders',
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'retro',

  examplePrompts: [
    'Build a drive-in theater ticketing platform',
    'Create an outdoor cinema booking app',
    'I need a drive-in movie management system',
    'Build a car cinema reservation platform',
    'Create a pop-up cinema app',
  ],
};
