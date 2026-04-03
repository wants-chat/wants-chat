/**
 * Theater App Type Definition
 *
 * Complete definition for theater and performing arts venue applications.
 * Essential for theaters, performing arts centers, and live entertainment venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THEATER_APP_TYPE: AppTypeDefinition = {
  id: 'theater',
  name: 'Theater',
  category: 'entertainment',
  description: 'Theater platform with show scheduling, ticket sales, seat selection, and subscription management',
  icon: 'drama',

  keywords: [
    'theater',
    'theatre',
    'performing arts',
    'live theater',
    'stage show',
    'broadway',
    'musical theater',
    'play',
    'drama',
    'performing arts center',
    'theater tickets',
    'box office',
    'season tickets',
    'theater subscription',
    'community theater',
    'dinner theater',
    'repertory theater',
    'live performance',
    'stage production',
    'theater venue',
    'auditorium',
  ],

  synonyms: [
    'theater platform',
    'theater software',
    'performing arts software',
    'theater management software',
    'theater ticketing system',
    'performing arts center software',
    'theater box office software',
    'live theater platform',
    'stage show management',
    'theater venue software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'movie theater'],

  sections: [
    { id: 'frontend', name: 'Patron Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse shows and buy tickets' },
    { id: 'admin', name: 'Theater Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Shows and box office' },
  ],

  roles: [
    { id: 'admin', name: 'Artistic Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'House Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shows' },
    { id: 'boxoffice', name: 'Box Office', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'production', name: 'Production Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'usher', name: 'Usher', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/seating' },
    { id: 'patron', name: 'Patron', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
    'reviews',
    'team-management',
    'analytics',
    'venue-booking',
    'season-passes',
    'backstage-access',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a theater ticketing platform',
    'Create a performing arts center app',
    'I need a theater management system',
    'Build a community theater with subscriptions',
    'Create a live theater venue platform',
  ],
};
