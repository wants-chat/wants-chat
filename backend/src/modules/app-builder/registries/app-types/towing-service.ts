/**
 * Towing Service App Type Definition
 *
 * Complete definition for towing and roadside assistance operations.
 * Essential for towing companies, roadside assistance, and recovery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'towing-service',
  name: 'Towing Service',
  category: 'automotive',
  description: 'Towing service platform with dispatch management, driver tracking, impound lot, and motor club integration',
  icon: 'truck',

  keywords: [
    'towing service',
    'roadside assistance',
    'towing service software',
    'recovery service',
    'tow truck',
    'towing service management',
    'dispatch management',
    'towing service practice',
    'towing service scheduling',
    'driver tracking',
    'towing service crm',
    'impound lot',
    'towing service business',
    'motor club',
    'towing service pos',
    'flatbed towing',
    'towing service operations',
    'accident recovery',
    'towing service platform',
    'police rotation',
  ],

  synonyms: [
    'towing service platform',
    'towing service software',
    'roadside assistance software',
    'recovery service software',
    'tow truck software',
    'dispatch management software',
    'towing service practice software',
    'driver tracking software',
    'impound lot software',
    'accident recovery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service requests' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Calls and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'fleet-tracking',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
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
  industry: 'automotive',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a towing service platform',
    'Create a roadside assistance portal',
    'I need a tow dispatch system',
    'Build an impound management platform',
    'Create a towing operations app',
  ],
};
