/**
 * Public Transit App Type Definition
 *
 * Complete definition for public transit and transportation authority applications.
 * Essential for transit agencies, bus systems, and public transportation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_TRANSIT_APP_TYPE: AppTypeDefinition = {
  id: 'public-transit',
  name: 'Public Transit',
  category: 'government',
  description: 'Transit platform with route planning, real-time tracking, fare payment, and service alerts',
  icon: 'bus',

  keywords: [
    'public transit',
    'transit system',
    'bus system',
    'transit agency',
    'public transportation',
    'transit app',
    'bus routes',
    'transit schedule',
    'transit fare',
    'transit pass',
    'transit tracker',
    'bus tracker',
    'transit planning',
    'metro system',
    'light rail',
    'transit alerts',
    'trip planner',
    'transit software',
    'transit authority',
    'commuter transit',
  ],

  synonyms: [
    'public transit platform',
    'transit system software',
    'transit agency software',
    'public transportation software',
    'transit tracker software',
    'transit scheduling software',
    'bus system software',
    'transit fare software',
    'transit planning software',
    'transit management platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'transit visa'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Routes and fares' },
    { id: 'admin', name: 'Transit Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Transit Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'staff', name: 'Dispatcher', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vehicles' },
    { id: 'driver', name: 'Driver', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'rider', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a public transit app',
    'Create a transit agency platform',
    'I need a bus tracking system',
    'Build a transit fare payment app',
    'Create a trip planner for transit',
  ],
};
