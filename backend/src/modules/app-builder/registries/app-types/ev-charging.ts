/**
 * EV Charging App Type Definition
 *
 * Complete definition for EV charging station applications.
 * Essential for EV charging networks, charging station operators, and fleet charging.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EV_CHARGING_APP_TYPE: AppTypeDefinition = {
  id: 'ev-charging',
  name: 'EV Charging',
  category: 'energy',
  description: 'EV charging platform with station management, driver app, billing, and network monitoring',
  icon: 'battery-charging',

  keywords: [
    'ev charging',
    'electric vehicle charging',
    'ev charging station',
    'ev charging software',
    'charging network',
    'ev charging management',
    'charging point',
    'ev charger',
    'charging station operator',
    'ev charging billing',
    'ev charging app',
    'electric car charging',
    'charging infrastructure',
    'ev charging business',
    'fleet charging',
    'workplace charging',
    'residential charging',
    'public charging',
    'ev charging payment',
    'charger management',
  ],

  synonyms: [
    'ev charging platform',
    'ev charging software',
    'charging station software',
    'ev charging management software',
    'charging network software',
    'ev charger software',
    'charging point software',
    'ev charging billing software',
    'charging operator software',
    'ev charging app software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'phone charging'],

  sections: [
    { id: 'frontend', name: 'Driver App', enabled: true, basePath: '/', layout: 'public', description: 'Find and pay' },
    { id: 'admin', name: 'Operator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Stations and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Network Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/stations' },
    { id: 'operator', name: 'Site Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/monitoring' },
    { id: 'technician', name: 'Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/maintenance' },
    { id: 'driver', name: 'Driver', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an EV charging platform',
    'Create a charging station management app',
    'I need an EV charging network system',
    'Build a fleet charging app',
    'Create an EV charger billing platform',
  ],
};
