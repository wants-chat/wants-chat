/**
 * Festival Organizer App Type Definition
 *
 * Complete definition for festival and large-scale event organization.
 * Essential for festival organizers, music festival planners, and cultural event managers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FESTIVAL_ORGANIZER_APP_TYPE: AppTypeDefinition = {
  id: 'festival-organizer',
  name: 'Festival Organizer',
  category: 'events',
  description: 'Festival organizing platform with artist booking, stage scheduling, ticket management, and vendor coordination',
  icon: 'music',

  keywords: [
    'festival organizer',
    'music festival',
    'festival organizer software',
    'cultural festival',
    'outdoor events',
    'festival organizer management',
    'artist booking',
    'festival organizer practice',
    'festival organizer scheduling',
    'stage management',
    'festival organizer crm',
    'ticket sales',
    'festival organizer business',
    'food vendors',
    'festival organizer pos',
    'crowd management',
    'festival organizer operations',
    'camping coordination',
    'festival organizer services',
    'event production',
  ],

  synonyms: [
    'festival organizer platform',
    'festival organizer software',
    'music festival software',
    'cultural festival software',
    'outdoor events software',
    'artist booking software',
    'festival organizer practice software',
    'stage management software',
    'ticket sales software',
    'event production software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Attendee Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and lineup' },
    { id: 'admin', name: 'Festival Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Festival and artists' },
  ],

  roles: [
    { id: 'admin', name: 'Festival Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'producer', name: 'Event Producer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/festivals' },
    { id: 'coordinator', name: 'Stage Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/stages' },
    { id: 'attendee', name: 'Festival Goer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'events',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
    'Build a festival organizing platform',
    'Create a music festival management portal',
    'I need a cultural festival planning system',
    'Build a festival organizer business platform',
    'Create an artist booking and stage scheduling app',
  ],
};
