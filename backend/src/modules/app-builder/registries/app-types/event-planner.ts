/**
 * Event Planner App Type Definition
 *
 * Complete definition for event planning operations.
 * Essential for event planners, party coordinators, and celebration specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_PLANNER_APP_TYPE: AppTypeDefinition = {
  id: 'event-planner',
  name: 'Event Planner',
  category: 'services',
  description: 'Event planner platform with client management, vendor coordination, timeline planning, and budget tracking',
  icon: 'calendar-check',

  keywords: [
    'event planner',
    'party coordinator',
    'event planner software',
    'celebration specialist',
    'event design',
    'event planner management',
    'client management',
    'event planner practice',
    'event planner scheduling',
    'vendor coordination',
    'event planner crm',
    'timeline planning',
    'event planner business',
    'budget tracking',
    'event planner pos',
    'theme parties',
    'event planner operations',
    'milestone events',
    'event planner platform',
    'event design',
  ],

  synonyms: [
    'event planner platform',
    'event planner software',
    'party coordinator software',
    'celebration specialist software',
    'event design software',
    'client management software',
    'event planner practice software',
    'vendor coordination software',
    'timeline planning software',
    'budget tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Events and planning' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and vendors' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Lead Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'coordinator', name: 'Event Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build an event planner platform',
    'Create a party coordinator portal',
    'I need an event planning management system',
    'Build a vendor coordination platform',
    'Create a timeline and budget tracking app',
  ],
};
