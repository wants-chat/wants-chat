/**
 * Conference Organizer App Type Definition
 *
 * Complete definition for conference and summit organization.
 * Essential for conference organizers, summit planners, and professional event managers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONFERENCE_ORGANIZER_APP_TYPE: AppTypeDefinition = {
  id: 'conference-organizer',
  name: 'Conference Organizer',
  category: 'events',
  description: 'Conference organizing platform with speaker management, session scheduling, attendee networking, and sponsor coordination',
  icon: 'users',

  keywords: [
    'conference organizer',
    'conference planning',
    'conference organizer software',
    'summit planning',
    'professional conferences',
    'conference organizer management',
    'speaker management',
    'conference organizer practice',
    'conference organizer scheduling',
    'session scheduling',
    'conference organizer crm',
    'attendee networking',
    'conference organizer business',
    'sponsor management',
    'conference organizer pos',
    'keynote speakers',
    'conference organizer operations',
    'breakout sessions',
    'conference organizer services',
    'professional events',
  ],

  synonyms: [
    'conference organizer platform',
    'conference organizer software',
    'conference planning software',
    'summit planning software',
    'professional conferences software',
    'speaker management software',
    'conference organizer practice software',
    'session scheduling software',
    'sponsor management software',
    'professional events software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Attendee Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and networking' },
    { id: 'admin', name: 'Organizer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Conferences and speakers' },
  ],

  roles: [
    { id: 'admin', name: 'Conference Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'organizer', name: 'Conference Organizer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/conferences' },
    { id: 'coordinator', name: 'Event Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'attendee', name: 'Attendee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'inventory-retail', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a conference organizing platform',
    'Create a summit planning portal',
    'I need a professional conference management system',
    'Build a conference organizer business platform',
    'Create a speaker and session management app',
  ],
};
