/**
 * Comedy Club App Type Definition
 *
 * Complete definition for comedy club and live comedy venue applications.
 * Essential for comedy clubs, improv theaters, and stand-up venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMEDY_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'comedy-club',
  name: 'Comedy Club',
  category: 'entertainment',
  description: 'Comedy club platform with show scheduling, ticket sales, comedian profiles, and food/drink ordering',
  icon: 'laugh',

  keywords: [
    'comedy club',
    'stand-up comedy',
    'comedy venue',
    'improv theater',
    'improv comedy',
    'comedy show',
    'comedy tickets',
    'comedian',
    'stand-up',
    'open mic',
    'comedy night',
    'comedy showcase',
    'headliner',
    'comedy special',
    'laugh factory',
    'comedy store',
    'improv',
    'sketch comedy',
    'comedy booking',
    'live comedy',
    'comedy entertainment',
  ],

  synonyms: [
    'comedy club platform',
    'comedy club software',
    'comedy venue software',
    'improv theater software',
    'comedy ticketing system',
    'comedy club management',
    'stand-up comedy platform',
    'comedy show software',
    'comedy booking software',
    'live comedy platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse shows and buy tickets' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Shows and comedians' },
  ],

  roles: [
    { id: 'admin', name: 'Club Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Club Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shows' },
    { id: 'booker', name: 'Talent Booker', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/comedians' },
    { id: 'host', name: 'Show Host', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tonight' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reservations' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'calendar',
    'notifications',
    'search',
    'ticket-sales',
    'seating-charts',
    'box-office',
    'show-scheduling',
    'performer-profiles',
  ],

  optionalFeatures: [
    'payments',
    'email',
    'analytics',
    'venue-booking',
    'backstage-access',
    'season-passes',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a comedy club platform',
    'Create a stand-up comedy venue app',
    'I need a comedy club ticketing system',
    'Build an improv theater with reservations',
    'Create a comedy show booking platform',
  ],
};
