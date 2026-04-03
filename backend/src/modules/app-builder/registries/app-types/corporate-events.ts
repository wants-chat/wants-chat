/**
 * Corporate Events App Type Definition
 *
 * Complete definition for corporate event planning and management.
 * Essential for corporate event planners, meeting coordinators, and business event services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CORPORATE_EVENTS_APP_TYPE: AppTypeDefinition = {
  id: 'corporate-events',
  name: 'Corporate Events',
  category: 'events',
  description: 'Corporate events platform with attendee registration, venue booking, agenda management, and networking facilitation',
  icon: 'briefcase',

  keywords: [
    'corporate events',
    'business events',
    'corporate events software',
    'meeting planning',
    'corporate gatherings',
    'corporate events management',
    'attendee registration',
    'corporate events practice',
    'corporate events scheduling',
    'company events',
    'corporate events crm',
    'business meetings',
    'corporate events business',
    'team building',
    'corporate events pos',
    'executive retreats',
    'corporate events operations',
    'networking events',
    'corporate events services',
    'conference planning',
  ],

  synonyms: [
    'corporate events platform',
    'corporate events software',
    'business events software',
    'meeting planning software',
    'corporate gatherings software',
    'attendee registration software',
    'corporate events practice software',
    'company events software',
    'team building software',
    'networking events software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Attendee Portal', enabled: true, basePath: '/', layout: 'public', description: 'Registration and agenda' },
    { id: 'admin', name: 'Event Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and attendees' },
  ],

  roles: [
    { id: 'admin', name: 'Event Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Event Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'coordinator', name: 'Event Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/logistics' },
    { id: 'attendee', name: 'Attendee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'inventory-retail', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a corporate events platform',
    'Create a business event management portal',
    'I need a corporate meeting planning system',
    'Build a corporate events business platform',
    'Create an attendee registration app',
  ],
};
