/**
 * Pool Service App Type Definition
 *
 * Complete definition for pool service and maintenance applications.
 * Essential for pool service companies, pool cleaners, and pool maintenance providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POOL_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'pool-service',
  name: 'Pool Service',
  category: 'services',
  description: 'Pool service platform with route management, water testing, chemical tracking, and customer management',
  icon: 'water',

  keywords: [
    'pool service',
    'pool cleaning',
    'pool maintenance',
    'pool care',
    'pool company',
    'swimming pool',
    'pool chemicals',
    'pool repair',
    'pool equipment',
    'water testing',
    'pool route',
    'spa service',
    'hot tub',
    'pool opening',
    'pool closing',
    'green pool',
    'algae treatment',
    'pool filter',
    'pool pump',
    'pool heater',
    'pool renovation',
    'pool technician',
  ],

  synonyms: [
    'pool service platform',
    'pool cleaning software',
    'pool maintenance app',
    'pool route software',
    'pool company app',
    'pool business software',
    'pool service management',
    'pool cleaning app',
    'pool care software',
    'pool technician app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'View service history and request service' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Route and technician management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'technician', name: 'Pool Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-route' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-pool' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'gallery',
    'inventory',
    'invoicing',
    'contracts',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a pool service management platform',
    'Create a pool cleaning route software',
    'I need a pool maintenance business app',
    'Build a pool company management system',
    'Create a pool technician scheduling app',
  ],
};
