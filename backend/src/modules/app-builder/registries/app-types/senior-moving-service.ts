/**
 * Senior Moving Service App Type Definition
 *
 * Complete definition for senior moving service operations.
 * Essential for senior relocation specialists, downsizing services, and elderly move management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_MOVING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'senior-moving-service',
  name: 'Senior Moving Service',
  category: 'services',
  description: 'Senior moving platform with move planning, downsizing assistance, estate sales, and transition support',
  icon: 'package',

  keywords: [
    'senior moving service',
    'senior relocation',
    'senior moving service software',
    'downsizing service',
    'elderly move',
    'senior moving service management',
    'move planning',
    'senior moving service practice',
    'senior moving service scheduling',
    'downsizing assistance',
    'senior moving service crm',
    'estate sales',
    'senior moving service business',
    'transition support',
    'senior moving service pos',
    'rightsizing',
    'senior moving service operations',
    'packing services',
    'senior moving service platform',
    'settling in',
  ],

  synonyms: [
    'senior moving service platform',
    'senior moving service software',
    'senior relocation software',
    'downsizing service software',
    'elderly move software',
    'move planning software',
    'senior moving service practice software',
    'downsizing assistance software',
    'estate sales software',
    'rightsizing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Moving and services' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and moves' },
  ],

  roles: [
    { id: 'admin', name: 'Service Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Move Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'coordinator', name: 'Move Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/moves' },
    { id: 'client', name: 'Client/Family', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'route-optimization',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a senior moving service platform',
    'Create a senior relocation app',
    'I need a downsizing service system',
    'Build an elderly move management app',
    'Create a senior moving portal',
  ],
};
