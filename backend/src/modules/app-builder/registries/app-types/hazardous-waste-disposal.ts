/**
 * Hazardous Waste Disposal App Type Definition
 *
 * Complete definition for hazardous waste disposal operations.
 * Essential for hazmat disposal companies, chemical waste handlers, and industrial waste services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAZARDOUS_WASTE_DISPOSAL_APP_TYPE: AppTypeDefinition = {
  id: 'hazardous-waste-disposal',
  name: 'Hazardous Waste Disposal',
  category: 'environmental',
  description: 'Hazardous waste platform with manifesting, chain of custody, regulatory compliance, and disposal tracking',
  icon: 'alert-triangle',

  keywords: [
    'hazardous waste disposal',
    'hazmat disposal',
    'hazardous waste disposal software',
    'chemical waste',
    'industrial waste',
    'hazardous waste disposal management',
    'manifesting',
    'hazardous waste disposal practice',
    'hazardous waste disposal scheduling',
    'chain of custody',
    'hazardous waste disposal crm',
    'regulatory compliance',
    'hazardous waste disposal business',
    'disposal tracking',
    'hazardous waste disposal pos',
    'epa compliance',
    'hazardous waste disposal operations',
    'rcra regulations',
    'hazardous waste disposal platform',
    'treatment storage',
  ],

  synonyms: [
    'hazardous waste disposal platform',
    'hazardous waste disposal software',
    'hazmat disposal software',
    'chemical waste software',
    'industrial waste software',
    'manifesting software',
    'hazardous waste disposal practice software',
    'chain of custody software',
    'regulatory compliance software',
    'epa compliance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Generator Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pickups and manifests' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Compliance and tracking' },
  ],

  roles: [
    { id: 'admin', name: 'Operations Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Compliance Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/manifests' },
    { id: 'driver', name: 'Hazmat Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'generator', name: 'Waste Generator', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a hazardous waste disposal platform',
    'Create a hazmat disposal app',
    'I need a chemical waste handling system',
    'Build an industrial waste service app',
    'Create a hazardous waste disposal portal',
  ],
};
