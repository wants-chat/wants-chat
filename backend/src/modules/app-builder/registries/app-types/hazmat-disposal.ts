/**
 * Hazmat Disposal App Type Definition
 *
 * Complete definition for hazardous materials disposal and handling.
 * Essential for hazmat companies, industrial waste handlers, and specialty disposal.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAZMAT_DISPOSAL_APP_TYPE: AppTypeDefinition = {
  id: 'hazmat-disposal',
  name: 'Hazmat Disposal',
  category: 'environmental',
  description: 'Hazmat disposal platform with manifest tracking, compliance documentation, chain of custody, and regulatory reporting',
  icon: 'alert-triangle',

  keywords: [
    'hazmat disposal',
    'hazardous waste',
    'hazmat disposal software',
    'industrial waste',
    'chemical disposal',
    'hazmat disposal management',
    'manifest tracking',
    'hazmat disposal practice',
    'hazmat disposal scheduling',
    'chain of custody',
    'hazmat disposal crm',
    'rcra compliance',
    'hazmat disposal business',
    'tsdf operations',
    'hazmat disposal pos',
    'waste profiling',
    'hazmat disposal operations',
    'dot hazmat',
    'hazmat disposal services',
    'medical waste',
  ],

  synonyms: [
    'hazmat disposal platform',
    'hazmat disposal software',
    'hazardous waste software',
    'industrial waste software',
    'chemical disposal software',
    'manifest tracking software',
    'hazmat disposal practice software',
    'chain of custody software',
    'rcra compliance software',
    'medical waste software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Generator Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pickups and manifests' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Disposal and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Compliance Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/manifests' },
    { id: 'driver', name: 'Hazmat Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pickups' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a hazmat disposal platform',
    'Create a hazardous waste portal',
    'I need an industrial waste management system',
    'Build a chemical disposal tracking platform',
    'Create a manifest and compliance tracking app',
  ],
};
