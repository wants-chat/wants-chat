/**
 * Charity Gala App Type Definition
 *
 * Complete definition for charity gala and fundraising event management.
 * Essential for nonprofit event planners, gala coordinators, and fundraising managers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHARITY_GALA_APP_TYPE: AppTypeDefinition = {
  id: 'charity-gala',
  name: 'Charity Gala',
  category: 'events',
  description: 'Charity gala platform with donation tracking, auction management, table sales, and sponsor recognition',
  icon: 'gift',

  keywords: [
    'charity gala',
    'fundraising event',
    'charity gala software',
    'nonprofit events',
    'gala planning',
    'charity gala management',
    'donation tracking',
    'charity gala practice',
    'charity gala scheduling',
    'silent auction',
    'charity gala crm',
    'table sales',
    'charity gala business',
    'sponsor recognition',
    'charity gala pos',
    'live auction',
    'charity gala operations',
    'paddle raise',
    'charity gala services',
    'benefit dinner',
  ],

  synonyms: [
    'charity gala platform',
    'charity gala software',
    'fundraising event software',
    'nonprofit events software',
    'gala planning software',
    'donation tracking software',
    'charity gala practice software',
    'silent auction software',
    'table sales software',
    'benefit dinner software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and donations' },
    { id: 'admin', name: 'Gala Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and donors' },
  ],

  roles: [
    { id: 'admin', name: 'Event Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Gala Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'coordinator', name: 'Volunteer Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/volunteers' },
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
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a charity gala management platform',
    'Create a fundraising event portal',
    'I need a nonprofit gala planning system',
    'Build a charity event organizer platform',
    'Create a silent auction and donation app',
  ],
};
