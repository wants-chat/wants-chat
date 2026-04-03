/**
 * Sports Event App Type Definition
 *
 * Complete definition for sports event organization and athletic competitions.
 * Essential for sports event organizers, tournament directors, and athletic coordinators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_EVENT_APP_TYPE: AppTypeDefinition = {
  id: 'sports-event',
  name: 'Sports Event',
  category: 'events',
  description: 'Sports event platform with tournament brackets, team registration, scoring systems, and venue scheduling',
  icon: 'trophy',

  keywords: [
    'sports event',
    'tournament management',
    'sports event software',
    'athletic competition',
    'sports organization',
    'sports event management',
    'team registration',
    'sports event practice',
    'sports event scheduling',
    'tournament brackets',
    'sports event crm',
    'scoring systems',
    'sports event business',
    'race management',
    'sports event pos',
    'championship',
    'sports event operations',
    'athlete tracking',
    'sports event services',
    'competition management',
  ],

  synonyms: [
    'sports event platform',
    'sports event software',
    'tournament management software',
    'athletic competition software',
    'sports organization software',
    'team registration software',
    'sports event practice software',
    'tournament brackets software',
    'race management software',
    'competition management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Participant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Registration and results' },
    { id: 'admin', name: 'Event Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and teams' },
  ],

  roles: [
    { id: 'admin', name: 'Event Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'organizer', name: 'Tournament Organizer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'official', name: 'Event Official', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scoring' },
    { id: 'participant', name: 'Participant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a sports event management platform',
    'Create a tournament organizing portal',
    'I need a sports competition management system',
    'Build a sports event organizer platform',
    'Create a tournament bracket and scoring app',
  ],
};
