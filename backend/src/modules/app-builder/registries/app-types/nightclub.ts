/**
 * Nightclub App Type Definition
 *
 * Complete definition for nightclub and club venue applications.
 * Essential for nightclubs, dance clubs, and late-night venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NIGHTCLUB_APP_TYPE: AppTypeDefinition = {
  id: 'nightclub',
  name: 'Nightclub',
  category: 'entertainment',
  description: 'Nightclub platform with table reservations, bottle service, guest lists, and event management',
  icon: 'music',

  keywords: [
    'nightclub',
    'club software',
    'nightclub management',
    'bottle service',
    'vip reservations',
    'guest list',
    'club booking',
    'nightclub pos',
    'dance club',
    'nightclub events',
    'club promotions',
    'nightclub crm',
    'dj booking',
    'club scheduling',
    'nightclub business',
    'vip tables',
    'nightclub ticketing',
    'club access',
    'nightclub marketing',
    'club venue',
  ],

  synonyms: [
    'nightclub platform',
    'nightclub software',
    'club management software',
    'bottle service software',
    'nightclub reservation software',
    'club booking software',
    'nightclub pos software',
    'dance club software',
    'nightclub event software',
    'club venue software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'golf club'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reservations and events' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tables and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Club Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/guestlist' },
    { id: 'promoter', name: 'Promoter', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/guestlist' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'table-reservations',
    'menu-management',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
    'show-scheduling',
    'performer-profiles',
  ],

  optionalFeatures: [
    'food-ordering',
    'payments',
    'inventory',
    'gallery',
    'reporting',
    'analytics',
    'backstage-access',
    'season-passes',
    'box-office',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a nightclub reservation platform',
    'Create a bottle service booking app',
    'I need a nightclub management system',
    'Build a VIP table reservation app',
    'Create a club event ticketing platform',
  ],
};
