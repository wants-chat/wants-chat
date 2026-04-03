/**
 * Garage Door Service App Type Definition
 *
 * Complete definition for garage door installation and repair operations.
 * Essential for garage door companies, overhead door specialists, and door repair services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GARAGE_DOOR_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'garage-door-service',
  name: 'Garage Door Service',
  category: 'services',
  description: 'Garage door service platform with service dispatch, parts inventory, warranty management, and emergency response',
  icon: 'door-open',

  keywords: [
    'garage door service',
    'overhead door',
    'garage door service software',
    'door repair',
    'door installation',
    'garage door service management',
    'service dispatch',
    'garage door service practice',
    'garage door service scheduling',
    'parts inventory',
    'garage door service crm',
    'warranty management',
    'garage door service business',
    'emergency response',
    'garage door service pos',
    'spring replacement',
    'garage door service operations',
    'opener installation',
    'garage door service platform',
    'commercial doors',
  ],

  synonyms: [
    'garage door service platform',
    'garage door service software',
    'overhead door software',
    'door repair software',
    'door installation software',
    'service dispatch software',
    'garage door service practice software',
    'parts inventory software',
    'warranty management software',
    'spring replacement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service and quotes' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Dispatch and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a garage door service platform',
    'Create an overhead door repair app',
    'I need a garage door installation system',
    'Build a door service dispatch app',
    'Create a garage door company portal',
  ],
};
