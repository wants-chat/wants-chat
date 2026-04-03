/**
 * Locksmith Service App Type Definition
 *
 * Complete definition for locksmith service operations.
 * Essential for locksmiths, key services, and security lock specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOCKSMITH_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'locksmith-service',
  name: 'Locksmith Service',
  category: 'services',
  description: 'Locksmith service platform with emergency dispatch, service tracking, key inventory, and mobile locksmith management',
  icon: 'key',

  keywords: [
    'locksmith service',
    'key service',
    'locksmith service software',
    'lock specialist',
    'emergency lockout',
    'locksmith service management',
    'emergency dispatch',
    'locksmith service practice',
    'locksmith service scheduling',
    'service tracking',
    'locksmith service crm',
    'key inventory',
    'locksmith service business',
    'mobile locksmith',
    'locksmith service pos',
    'lock rekey',
    'locksmith service operations',
    'safe opening',
    'locksmith service platform',
    'access control',
  ],

  synonyms: [
    'locksmith service platform',
    'locksmith service software',
    'key service software',
    'lock specialist software',
    'emergency lockout software',
    'emergency dispatch software',
    'locksmith service practice software',
    'service tracking software',
    'key inventory software',
    'mobile locksmith software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service and quotes' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Dispatch and jobs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'locksmith', name: 'Locksmith', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gold',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a locksmith service platform',
    'Create a key service dispatch app',
    'I need an emergency lockout system',
    'Build a mobile locksmith app',
    'Create a locksmith business portal',
  ],
};
