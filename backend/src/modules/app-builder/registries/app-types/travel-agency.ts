/**
 * Travel Agency App Type Definition
 *
 * Complete definition for travel agency and tour operator applications.
 * Essential for travel agencies, tour operators, and vacation planners.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'travel-agency',
  name: 'Travel Agency',
  category: 'travel',
  description: 'Travel agency platform with trip booking, itinerary management, client CRM, and supplier integration',
  icon: 'plane',

  keywords: [
    'travel agency',
    'travel agent',
    'travel software',
    'travel booking',
    'tour operator',
    'travel management',
    'trip planning',
    'vacation packages',
    'travel itinerary',
    'travel crm',
    'travel business',
    'travel portal',
    'travel reservations',
    'travel quotes',
    'group travel',
    'corporate travel',
    'leisure travel',
    'travel agency software',
    'travel scheduling',
    'travel commissions',
  ],

  synonyms: [
    'travel agency platform',
    'travel agency software',
    'travel booking software',
    'tour operator software',
    'travel management software',
    'travel crm software',
    'trip planning software',
    'vacation booking software',
    'travel itinerary software',
    'travel agent software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'travel blog personal'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Trips and bookings' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Clients and reservations' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'agent', name: 'Travel Agent', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clients' },
    { id: 'assistant', name: 'Assistant', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'clients',
    'email',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a travel agency platform',
    'Create a tour operator booking app',
    'I need a travel agent CRM system',
    'Build a vacation planning platform',
    'Create a trip booking agency app',
  ],
};
