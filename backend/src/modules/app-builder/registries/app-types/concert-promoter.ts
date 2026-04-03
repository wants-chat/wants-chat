/**
 * Concert Promoter App Type Definition
 *
 * Complete definition for concert promotion and live music event management.
 * Essential for concert promoters, live event managers, and music venue operators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONCERT_PROMOTER_APP_TYPE: AppTypeDefinition = {
  id: 'concert-promoter',
  name: 'Concert Promoter',
  category: 'events',
  description: 'Concert promotion platform with artist management, venue booking, ticket sales, and tour coordination',
  icon: 'mic',

  keywords: [
    'concert promoter',
    'live music',
    'concert promoter software',
    'music events',
    'tour management',
    'concert promoter management',
    'artist management',
    'concert promoter practice',
    'concert promoter scheduling',
    'venue booking',
    'concert promoter crm',
    'ticket sales',
    'concert promoter business',
    'show promotion',
    'concert promoter pos',
    'backstage coordination',
    'concert promoter operations',
    'tour routing',
    'concert promoter services',
    'live events',
  ],

  synonyms: [
    'concert promoter platform',
    'concert promoter software',
    'live music software',
    'music events software',
    'tour management software',
    'artist management software',
    'concert promoter practice software',
    'venue booking software',
    'show promotion software',
    'live events software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Ticket Portal', enabled: true, basePath: '/', layout: 'public', description: 'Shows and tickets' },
    { id: 'admin', name: 'Promoter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Shows and artists' },
  ],

  roles: [
    { id: 'admin', name: 'Promoter Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'promoter', name: 'Concert Promoter', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shows' },
    { id: 'coordinator', name: 'Event Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
    { id: 'customer', name: 'Concert Goer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'show-scheduling',
    'performer-profiles',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reporting',
    'analytics',
    'seating-charts',
    'box-office',
    'backstage-access',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a concert promotion platform',
    'Create a live music event management portal',
    'I need a concert promoter management system',
    'Build a show promotion business platform',
    'Create a tour management and ticketing app',
  ],
};
