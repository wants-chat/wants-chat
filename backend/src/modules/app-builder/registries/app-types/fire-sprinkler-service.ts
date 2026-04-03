/**
 * Fire Sprinkler Service App Type Definition
 *
 * Complete definition for fire sprinkler installation and service operations.
 * Essential for fire sprinkler contractors, fire protection specialists, and suppression system companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_SPRINKLER_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'fire-sprinkler-service',
  name: 'Fire Sprinkler Service',
  category: 'services',
  description: 'Fire sprinkler service platform with inspection scheduling, compliance tracking, installation projects, and emergency repairs',
  icon: 'droplets',

  keywords: [
    'fire sprinkler service',
    'fire protection',
    'fire sprinkler service software',
    'suppression system',
    'fire safety',
    'fire sprinkler service management',
    'inspection scheduling',
    'fire sprinkler service practice',
    'fire sprinkler service scheduling',
    'compliance tracking',
    'fire sprinkler service crm',
    'installation projects',
    'fire sprinkler service business',
    'emergency repairs',
    'fire sprinkler service pos',
    'backflow testing',
    'fire sprinkler service operations',
    'fire alarm',
    'fire sprinkler service platform',
    'nfpa compliance',
  ],

  synonyms: [
    'fire sprinkler service platform',
    'fire sprinkler service software',
    'fire protection software',
    'suppression system software',
    'fire safety software',
    'inspection scheduling software',
    'fire sprinkler service practice software',
    'compliance tracking software',
    'installation projects software',
    'backflow testing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inspections and reports' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Fire Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'customer', name: 'Building Manager', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'site-safety',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'contracts',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'material-takeoffs',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'safety',

  examplePrompts: [
    'Build a fire sprinkler service platform',
    'Create a fire protection company app',
    'I need a sprinkler inspection system',
    'Build a fire safety business app',
    'Create a fire sprinkler contractor portal',
  ],
};
