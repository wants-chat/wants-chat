/**
 * Septic Service App Type Definition
 *
 * Complete definition for septic system service operations.
 * Essential for septic pumping companies, wastewater specialists, and septic installers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEPTIC_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'septic-service',
  name: 'Septic Service',
  category: 'services',
  description: 'Septic service platform with scheduling management, tank records, pump tracking, and compliance documentation',
  icon: 'droplet',

  keywords: [
    'septic service',
    'septic pumping',
    'septic service software',
    'wastewater',
    'septic installation',
    'septic service management',
    'scheduling management',
    'septic service practice',
    'septic service scheduling',
    'tank records',
    'septic service crm',
    'pump tracking',
    'septic service business',
    'compliance documentation',
    'septic service pos',
    'drain field',
    'septic service operations',
    'grease trap',
    'septic service platform',
    'tank inspection',
  ],

  synonyms: [
    'septic service platform',
    'septic service software',
    'septic pumping software',
    'wastewater software',
    'septic installation software',
    'scheduling management software',
    'septic service practice software',
    'tank records software',
    'pump tracking software',
    'drain field software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service and records' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and pumping' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Pump Truck Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'practical',

  examplePrompts: [
    'Build a septic service platform',
    'Create a septic pumping company app',
    'I need a wastewater service system',
    'Build a septic business management app',
    'Create a septic service portal',
  ],
};
