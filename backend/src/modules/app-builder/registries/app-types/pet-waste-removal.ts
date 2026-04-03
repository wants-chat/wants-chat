/**
 * Pet Waste Removal App Type Definition
 *
 * Complete definition for pet waste removal service operations.
 * Essential for pooper scooper services, yard cleaning companies, and pet waste management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_WASTE_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'pet-waste-removal',
  name: 'Pet Waste Removal',
  category: 'services',
  description: 'Pet waste removal platform with service scheduling, route management, recurring plans, and customer tracking',
  icon: 'leaf',

  keywords: [
    'pet waste removal',
    'pooper scooper',
    'pet waste removal software',
    'yard cleaning',
    'dog waste',
    'pet waste removal management',
    'service scheduling',
    'pet waste removal practice',
    'pet waste removal scheduling',
    'route management',
    'pet waste removal crm',
    'recurring plans',
    'pet waste removal business',
    'customer tracking',
    'pet waste removal pos',
    'yard maintenance',
    'pet waste removal operations',
    'weekly service',
    'pet waste removal platform',
    'odor control',
  ],

  synonyms: [
    'pet waste removal platform',
    'pet waste removal software',
    'pooper scooper software',
    'yard cleaning software',
    'dog waste software',
    'service scheduling software',
    'pet waste removal practice software',
    'route management software',
    'recurring plans software',
    'yard maintenance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and plans' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Route Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/routes' },
    { id: 'technician', name: 'Field Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a pet waste removal platform',
    'Create a pooper scooper service app',
    'I need a yard cleaning business system',
    'Build a pet waste management app',
    'Create a pet waste removal portal',
  ],
};
