/**
 * Wildlife Management App Type Definition
 *
 * Complete definition for wildlife management and control services.
 * Essential for wildlife control, animal removal, and conservation services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDLIFE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'wildlife-management',
  name: 'Wildlife Management',
  category: 'environmental',
  description: 'Wildlife management platform with service calls, animal tracking, exclusion work, and client management',
  icon: 'bird',

  keywords: [
    'wildlife management',
    'animal control',
    'wildlife management software',
    'wildlife removal',
    'nuisance wildlife',
    'wildlife management control',
    'service calls',
    'wildlife management practice',
    'wildlife management scheduling',
    'animal tracking',
    'wildlife management crm',
    'exclusion work',
    'wildlife management business',
    'bat removal',
    'wildlife management pos',
    'raccoon removal',
    'wildlife management operations',
    'bird control',
    'wildlife management services',
    'humane trapping',
  ],

  synonyms: [
    'wildlife management platform',
    'wildlife management software',
    'animal control software',
    'wildlife removal software',
    'nuisance wildlife software',
    'service calls software',
    'wildlife management practice software',
    'animal tracking software',
    'exclusion work software',
    'humane trapping software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Calls and wildlife' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/calls' },
    { id: 'technician', name: 'Wildlife Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a wildlife management platform',
    'Create an animal control portal',
    'I need a wildlife removal management system',
    'Build a nuisance wildlife service platform',
    'Create a service call and exclusion tracking app',
  ],
};
