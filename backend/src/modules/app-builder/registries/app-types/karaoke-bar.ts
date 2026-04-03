/**
 * Karaoke Bar App Type Definition
 *
 * Complete definition for karaoke bars and private room applications.
 * Essential for karaoke bars, singing rooms, and karaoke venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KARAOKE_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'karaoke-bar',
  name: 'Karaoke Bar',
  category: 'entertainment',
  description: 'Karaoke bar platform with room reservations, song catalog, food/drink ordering, and party packages',
  icon: 'microphone',

  keywords: [
    'karaoke bar',
    'karaoke room',
    'karaoke software',
    'private karaoke',
    'karaoke booking',
    'singing room',
    'karaoke venue',
    'ktv',
    'karaoke lounge',
    'karaoke scheduling',
    'song catalog',
    'karaoke crm',
    'karaoke party',
    'karaoke pos',
    'karaoke business',
    'karaoke management',
    'karaoke entertainment',
    'karaoke packages',
    'karaoke reservations',
    'singing venue',
  ],

  synonyms: [
    'karaoke bar platform',
    'karaoke bar software',
    'karaoke room software',
    'karaoke booking software',
    'ktv software',
    'karaoke lounge software',
    'karaoke venue software',
    'karaoke management software',
    'karaoke reservation software',
    'singing room software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'karaoke machine'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reservations and songs' },
    { id: 'admin', name: 'Karaoke Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Rooms and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Venue Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rooms' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'table-reservations',
    'menu-management',
    'food-ordering',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'reminders',
    'reporting',
    'analytics',
    'season-passes',
    'show-scheduling',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a karaoke bar booking platform',
    'Create a karaoke room reservation app',
    'I need a KTV management system',
    'Build a karaoke venue app',
    'Create a singing room booking platform',
  ],
};
