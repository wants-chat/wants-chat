/**
 * Elevator Service App Type Definition
 *
 * Complete definition for elevator service and maintenance operations.
 * Essential for elevator service companies, lift specialists, and vertical transportation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELEVATOR_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'elevator-service',
  name: 'Elevator Service',
  category: 'services',
  description: 'Elevator service platform with maintenance scheduling, inspection tracking, emergency response, and compliance documentation',
  icon: 'arrow-up-down',

  keywords: [
    'elevator service',
    'lift specialist',
    'elevator service software',
    'vertical transportation',
    'escalator service',
    'elevator service management',
    'maintenance scheduling',
    'elevator service practice',
    'elevator service scheduling',
    'inspection tracking',
    'elevator service crm',
    'emergency response',
    'elevator service business',
    'compliance documentation',
    'elevator service pos',
    'modernization',
    'elevator service operations',
    'accessibility lift',
    'elevator service platform',
    'dumbwaiter',
  ],

  synonyms: [
    'elevator service platform',
    'elevator service software',
    'lift specialist software',
    'vertical transportation software',
    'escalator service software',
    'maintenance scheduling software',
    'elevator service practice software',
    'inspection tracking software',
    'emergency response software',
    'modernization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service and reports' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Maintenance and calls' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Elevator Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calls' },
    { id: 'customer', name: 'Building Manager', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'contracts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an elevator service platform',
    'Create a lift maintenance app',
    'I need an elevator inspection system',
    'Build an elevator company management app',
    'Create an elevator service portal',
  ],
};
