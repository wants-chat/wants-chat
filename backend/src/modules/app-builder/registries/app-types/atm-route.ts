/**
 * ATM Route App Type Definition
 *
 * Complete definition for ATM route and cash operations.
 * Essential for ATM operators, cash loading services, and ATM placement companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATM_ROUTE_APP_TYPE: AppTypeDefinition = {
  id: 'atm-route',
  name: 'ATM Route',
  category: 'services',
  description: 'ATM route platform with cash management, route optimization, machine monitoring, and revenue tracking',
  icon: 'credit-card',

  keywords: [
    'atm route',
    'atm operator',
    'atm route software',
    'cash loading',
    'atm placement',
    'atm route management',
    'cash management',
    'atm route practice',
    'atm route scheduling',
    'route optimization',
    'atm route crm',
    'machine monitoring',
    'atm route business',
    'revenue tracking',
    'atm route pos',
    'atm service',
    'atm route operations',
    'surcharge revenue',
    'atm route platform',
    'iso operator',
  ],

  synonyms: [
    'atm route platform',
    'atm route software',
    'atm operator software',
    'cash loading software',
    'atm placement software',
    'cash management software',
    'atm route practice software',
    'route optimization software',
    'machine monitoring software',
    'atm service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Location Portal', enabled: true, basePath: '/', layout: 'public', description: 'ATM placement and service' },
    { id: 'admin', name: 'Route Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and cash' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'technician', name: 'Field Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/machines' },
    { id: 'location', name: 'Location Partner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'scheduling',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'secure',

  examplePrompts: [
    'Build an ATM route platform',
    'Create an ATM operator management app',
    'I need an ATM cash management system',
    'Build an ATM placement business app',
    'Create an ATM route portal',
  ],
};
