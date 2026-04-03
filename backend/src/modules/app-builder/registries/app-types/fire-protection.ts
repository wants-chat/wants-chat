/**
 * Fire Protection App Type Definition
 *
 * Complete definition for fire protection services.
 * Essential for fire alarm companies, sprinkler services, and fire safety.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_PROTECTION_APP_TYPE: AppTypeDefinition = {
  id: 'fire-protection',
  name: 'Fire Protection',
  category: 'security',
  description: 'Fire protection platform with inspection scheduling, compliance tracking, service management, and deficiency reports',
  icon: 'flame',

  keywords: [
    'fire protection',
    'fire alarm',
    'fire protection software',
    'sprinkler systems',
    'fire extinguishers',
    'fire protection management',
    'inspection scheduling',
    'fire protection practice',
    'fire protection scheduling',
    'compliance tracking',
    'fire protection crm',
    'fire suppression',
    'fire protection business',
    'deficiency reports',
    'fire protection pos',
    'emergency lighting',
    'fire protection operations',
    'fire doors',
    'fire protection platform',
    'kitchen suppression',
  ],

  synonyms: [
    'fire protection platform',
    'fire protection software',
    'fire alarm software',
    'sprinkler systems software',
    'fire extinguishers software',
    'inspection scheduling software',
    'fire protection practice software',
    'compliance tracking software',
    'fire suppression software',
    'deficiency reports software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and scheduling' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inspections' },
    { id: 'tech', name: 'Fire Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fire protection service platform',
    'Create a fire alarm inspection portal',
    'I need a sprinkler service management system',
    'Build a compliance tracking platform',
    'Create an inspection and deficiency app',
  ],
};
