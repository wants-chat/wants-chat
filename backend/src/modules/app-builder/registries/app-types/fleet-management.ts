/**
 * Fleet Management App Type Definition
 *
 * Complete definition for fleet management and vehicle tracking applications.
 * Essential for logistics companies, delivery services, and transportation fleets.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLEET_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'fleet-management',
  name: 'Fleet Management',
  category: 'logistics',
  description: 'Fleet management platform with vehicle tracking, driver management, maintenance scheduling, and route optimization',
  icon: 'truck',

  keywords: [
    'fleet management',
    'vehicle tracking',
    'gps tracking',
    'fleet tracking',
    'driver management',
    'vehicle management',
    'fleet operations',
    'telematics',
    'fleet software',
    'vehicle fleet',
    'truck tracking',
    'delivery fleet',
    'transport fleet',
    'fleet maintenance',
    'route optimization',
    'fuel management',
    'driver safety',
    'fleet analytics',
    'vehicle dispatch',
    'commercial fleet',
  ],

  synonyms: [
    'fleet management platform',
    'fleet management software',
    'vehicle tracking software',
    'fleet tracking system',
    'telematics platform',
    'fleet operations software',
    'vehicle management system',
    'driver management software',
    'fleet logistics software',
    'transport management platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'personal vehicle'],

  sections: [
    { id: 'frontend', name: 'Driver Portal', enabled: true, basePath: '/', layout: 'public', description: 'Driver access and routes' },
    { id: 'admin', name: 'Fleet Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Fleet and driver management' },
  ],

  roles: [
    { id: 'admin', name: 'Fleet Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Fleet Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/vehicles' },
    { id: 'dispatcher', name: 'Dispatcher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'mechanic', name: 'Mechanic', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/maintenance' },
    { id: 'driver', name: 'Driver', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
    'fleet-tracking',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
    'carrier-integration',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fleet management platform',
    'Create a vehicle tracking system',
    'I need a fleet operations app',
    'Build a driver management platform',
    'Create a logistics fleet tracker',
  ],
};
