/**
 * Municipal Services App Type Definition
 *
 * Complete definition for municipal services and 311 request applications.
 * Essential for city service requests, code enforcement, and public works.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUNICIPAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'municipal-services',
  name: 'Municipal Services',
  category: 'government',
  description: 'Municipal services platform with service requests, issue reporting, work order management, and citizen engagement',
  icon: 'building-2',

  keywords: [
    'municipal services',
    '311 system',
    'service requests',
    'city services',
    'issue reporting',
    'pothole reporting',
    'code enforcement',
    'public works',
    'city maintenance',
    'citizen requests',
    'service tickets',
    '311 app',
    'city reporting',
    'graffiti removal',
    'streetlight outage',
    'city complaints',
    'work orders',
    'city issues',
    'municipal software',
    'civic engagement',
  ],

  synonyms: [
    'municipal services platform',
    '311 system software',
    'service request software',
    'city services software',
    'issue reporting software',
    'code enforcement software',
    'public works software',
    'citizen request software',
    'work order software',
    'civic engagement platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'web services'],

  sections: [
    { id: 'frontend', name: 'Citizen Portal', enabled: true, basePath: '/', layout: 'public', description: 'Report issues and track' },
    { id: 'admin', name: 'Services Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Work orders and dispatch' },
  ],

  roles: [
    { id: 'admin', name: 'Services Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Department Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/requests' },
    { id: 'staff', name: 'Customer Service', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
    { id: 'crew', name: 'Field Crew', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/workorders' },
    { id: 'citizen', name: 'Citizen', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a 311 system',
    'Create a municipal services app',
    'I need a city issue reporting system',
    'Build a service request platform',
    'Create a public works management app',
  ],
};
