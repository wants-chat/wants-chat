/**
 * Irrigation App Type Definition
 *
 * Complete definition for irrigation service operations.
 * Essential for sprinkler companies, irrigation contractors, and water management services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IRRIGATION_APP_TYPE: AppTypeDefinition = {
  id: 'irrigation',
  name: 'Irrigation',
  category: 'services',
  description: 'Irrigation platform with system design, installation scheduling, maintenance tracking, and smart controller integration',
  icon: 'droplets',

  keywords: [
    'irrigation',
    'sprinkler system',
    'irrigation software',
    'irrigation contractor',
    'water management',
    'irrigation management',
    'system design',
    'irrigation practice',
    'irrigation scheduling',
    'installation scheduling',
    'irrigation crm',
    'maintenance tracking',
    'irrigation business',
    'smart controllers',
    'irrigation pos',
    'drip irrigation',
    'irrigation operations',
    'landscape watering',
    'irrigation platform',
    'winterization',
  ],

  synonyms: [
    'irrigation platform',
    'irrigation software',
    'sprinkler system software',
    'irrigation contractor software',
    'water management software',
    'system design software',
    'irrigation practice software',
    'installation scheduling software',
    'maintenance tracking software',
    'smart controllers software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and systems' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and maintenance' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'System Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'technician', name: 'Irrigation Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'reporting',
    'analytics',
    'project-bids',
    'equipment-tracking',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an irrigation platform',
    'Create a sprinkler system portal',
    'I need an irrigation management system',
    'Build a system design platform',
    'Create a maintenance and smart controller app',
  ],
};
