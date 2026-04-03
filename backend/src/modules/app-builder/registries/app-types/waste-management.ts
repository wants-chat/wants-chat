/**
 * Waste Management App Type Definition
 *
 * Complete definition for waste management companies and disposal services.
 * Essential for waste haulers, garbage collection, and disposal facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WASTE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'waste-management',
  name: 'Waste Management',
  category: 'environmental',
  description: 'Waste management platform with route optimization, container tracking, customer billing, and compliance reporting',
  icon: 'trash-2',

  keywords: [
    'waste management',
    'garbage collection',
    'waste management software',
    'trash hauling',
    'disposal services',
    'waste management management',
    'route optimization',
    'waste management practice',
    'waste management scheduling',
    'container tracking',
    'waste management crm',
    'dumpster rental',
    'waste management business',
    'landfill operations',
    'waste management pos',
    'commercial waste',
    'waste management operations',
    'residential pickup',
    'waste management services',
    'roll-off containers',
  ],

  synonyms: [
    'waste management platform',
    'waste management software',
    'garbage collection software',
    'trash hauling software',
    'disposal services software',
    'route optimization software',
    'waste management practice software',
    'container tracking software',
    'dumpster rental software',
    'commercial waste software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and billing' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and containers' },
  ],

  roles: [
    { id: 'admin', name: 'Operations Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Route Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'driver', name: 'Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pickups' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a waste management platform',
    'Create a garbage collection portal',
    'I need a waste hauler management system',
    'Build a dumpster rental platform',
    'Create a route and container tracking app',
  ],
};
