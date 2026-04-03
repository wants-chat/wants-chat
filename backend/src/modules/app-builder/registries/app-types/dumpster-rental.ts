/**
 * Dumpster Rental App Type Definition
 *
 * Complete definition for dumpster rental operations.
 * Essential for roll-off dumpster companies, container rentals, and waste management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DUMPSTER_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'dumpster-rental',
  name: 'Dumpster Rental',
  category: 'services',
  description: 'Dumpster rental platform with container inventory, delivery scheduling, weight tracking, and billing automation',
  icon: 'container',

  keywords: [
    'dumpster rental',
    'roll off rental',
    'dumpster rental software',
    'container rental',
    'waste management',
    'dumpster rental management',
    'container inventory',
    'dumpster rental practice',
    'dumpster rental scheduling',
    'delivery scheduling',
    'dumpster rental crm',
    'weight tracking',
    'dumpster rental business',
    'billing automation',
    'dumpster rental pos',
    'construction dumpster',
    'dumpster rental operations',
    'demolition debris',
    'dumpster rental platform',
    'recycling container',
  ],

  synonyms: [
    'dumpster rental platform',
    'dumpster rental software',
    'roll off rental software',
    'container rental software',
    'waste management software',
    'container inventory software',
    'dumpster rental practice software',
    'delivery scheduling software',
    'weight tracking software',
    'construction dumpster software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rental and pricing' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'fleet-tracking',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a dumpster rental platform',
    'Create a roll-off container rental app',
    'I need a waste container booking system',
    'Build a construction dumpster rental app',
    'Create a dumpster delivery portal',
  ],
};
