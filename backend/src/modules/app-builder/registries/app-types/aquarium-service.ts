/**
 * Aquarium Service App Type Definition
 *
 * Complete definition for aquarium service operations.
 * Essential for aquarium maintenance, fish tank services, and aquatic specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUARIUM_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'aquarium-service',
  name: 'Aquarium Service',
  category: 'services',
  description: 'Aquarium service platform with maintenance scheduling, water testing logs, fish inventory, and client management',
  icon: 'fish',

  keywords: [
    'aquarium service',
    'fish tank maintenance',
    'aquarium service software',
    'aquatic specialist',
    'tank cleaning',
    'aquarium service management',
    'maintenance scheduling',
    'aquarium service practice',
    'aquarium service scheduling',
    'water testing',
    'aquarium service crm',
    'fish inventory',
    'aquarium service business',
    'client management',
    'aquarium service pos',
    'reef maintenance',
    'aquarium service operations',
    'aquascape design',
    'aquarium service platform',
    'livestock care',
  ],

  synonyms: [
    'aquarium service platform',
    'aquarium service software',
    'fish tank maintenance software',
    'aquatic specialist software',
    'tank cleaning software',
    'maintenance scheduling software',
    'aquarium service practice software',
    'water testing software',
    'fish inventory software',
    'reef maintenance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and reports' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and maintenance' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'technician', name: 'Lead Technician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Service Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
  industry: 'services',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an aquarium service platform',
    'Create a fish tank maintenance portal',
    'I need an aquarium service management system',
    'Build a water testing and maintenance platform',
    'Create a client and fish inventory app',
  ],
};
